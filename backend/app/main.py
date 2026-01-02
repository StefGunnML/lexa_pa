from fastapi import FastAPI, BackgroundTasks, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn
import httpx
from app.services.deepseek import DeepSeekService
from app.services.ingestion import process_ingestion
from app.models import get_db_engine, IngestionAuditLog, init_db, SessionLocal, SystemConfig, Playbook, PendingAction
from sqlalchemy.orm import sessionmaker
import asyncio
import os
import uuid
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Database
init_db()

app = FastAPI(title="Project Compass API")

# Pydantic models for API
class ConfigUpdate(BaseModel):
    key: str
    value: str

class PlaybookUpdate(BaseModel):
    content: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MeetingText(BaseModel):
    text: str
    meeting_id: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Welcome to Project Compass API"}

@app.get("/config")
async def get_config():
    db = SessionLocal()
    configs = db.query(SystemConfig).all()
    db.close()
    return {c.key: c.value for c in configs}

@app.post("/config")
async def update_config(data: ConfigUpdate):
    db = SessionLocal()
    config = db.query(SystemConfig).filter(SystemConfig.key == data.key).first()
    if not config:
        config = SystemConfig(key=data.key, value=data.value)
        db.add(config)
    else:
        config.value = data.value
    db.commit()
    db.close()
    return {"status": "updated"}

@app.post("/config/pulse-check")
async def pulse_check():
    ds = DeepSeekService()
    import time
    start = time.time()
    if await ds.ping():
        latency = int((time.time() - start) * 1000)
        return {"status": "active", "latency": f"{latency}ms"}
    else:
        return {"status": "inactive", "error": "Could not reach Scaleway vLLM node."}

@app.get("/playbook")
async def get_playbook():
    db = SessionLocal()
    playbook = db.query(Playbook).filter(Playbook.is_active == True).first()
    db.close()
    if not playbook:
        return {"content": "# Project Compass Playbook\n\nNo principles defined yet."}
    return {"content": playbook.content}

@app.post("/playbook")
async def update_playbook(data: PlaybookUpdate):
    db = SessionLocal()
    # Deactivate old playbooks
    db.query(Playbook).filter(Playbook.is_active == True).update({Playbook.is_active: False})
    new_playbook = Playbook(content=data.content, is_active=True)
    db.add(new_playbook)
    db.commit()
    db.close()
    return {"status": "saved"}

@app.get("/actions")
async def list_pending_actions():
    db = SessionLocal()
    actions = db.query(PendingAction).filter(PendingAction.status == 'pending').order_by(PendingAction.created_at.desc()).all()
    db.close()
    return actions

@app.post("/actions/{action_id}")
async def update_action_status(action_id: str, data: Dict[str, str]):
    db = SessionLocal()
    action = db.query(PendingAction).filter(PendingAction.id == action_id).first()
    if not action:
        db.close()
        raise HTTPException(status_code=404, detail="Action not found")
    
    action.status = data.get("status", "pending")
    db.commit()
    db.close()
    return {"status": "updated"}

@app.get("/nango/debug-db")
async def debug_nango_db():
    db = SessionLocal()
    logs = db.query(IngestionAuditLog).order_by(IngestionAuditLog.created_at.desc()).limit(10).all()
    configs = db.query(SystemConfig).all()
    db.close()
    return {
        "recent_audit_logs": [{
            "id": str(l.id),
            "platform": l.source_platform,
            "status": l.status,
            "created": l.created_at
        } for l in logs],
        "config_keys": [c.key for c in configs]
    }

@app.get("/nango/debug-connections")
async def debug_nango_connections():
    db = SessionLocal()
    nango_secret_entry = db.query(SystemConfig).filter(SystemConfig.key == "NANGO_SECRET_KEY").first()
    db.close()
    nango_secret = nango_secret_entry.value if nango_secret_entry else os.getenv("NANGO_SECRET_KEY")
    
    async with httpx.AsyncClient() as client:
        res = await client.get("https://api.nango.dev/connection", headers={"Authorization": f"Bearer {nango_secret}"})
        return res.json()

@app.get("/nango/debug-records")
async def debug_nango_records():
    db = SessionLocal()
    nango_secret_entry = db.query(SystemConfig).filter(SystemConfig.key == "NANGO_SECRET_KEY").first()
    db.close()
    nango_secret = nango_secret_entry.value if nango_secret_entry else os.getenv("NANGO_SECRET_KEY")
    
    async with httpx.AsyncClient() as client:
        conn_res = await client.get("https://api.nango.dev/connection", headers={"Authorization": f"Bearer {nango_secret}"})
        conns = conn_res.json().get("connections", [])
        if not conns:
            return {"error": "No connections found"}
        
        cid = conns[0]["connection_id"]
        sync_ids = ["gmail-sync", "slack-messages"]
        results = {}
        for sid in sync_ids:
            res = await client.get(f"https://api.nango.dev/sync/{sid}/records?connectionId={cid}", headers={"Authorization": f"Bearer {nango_secret}"})
            results[sid] = {
                "status": res.status_code,
                "data": res.json() if res.status_code == 200 else res.text[:200]
            }
        return results

@app.post("/nango/manual-sync")
async def manual_nango_sync():
    from app.services.gmail import GmailService
    from app.services.slack import SlackService
    
    db = SessionLocal()
    nango_secret_entry = db.query(SystemConfig).filter(SystemConfig.key == "NANGO_SECRET_KEY").first()
    nango_secret = nango_secret_entry.value if nango_secret_entry else os.getenv("NANGO_SECRET_KEY")
    
    if not nango_secret:
        db.close()
        return {"error": "NANGO_SECRET_KEY_MISSING"}

    async with httpx.AsyncClient() as client:
        conn_res = await client.get("https://api.nango.dev/connection", headers={"Authorization": f"Bearer {nango_secret}"})
        conns = conn_res.json().get("connections", [])
        
        results = []
        for conn in conns:
            cid = conn["connection_id"]
            platform = conn["provider_config_key"]
            
            if "google-mail" in platform:
                service = GmailService(db)
                res = await service.sync_gmail_threads(cid)
                results.append({"platform": platform, "result": res})
            elif "slack" in platform:
                service = SlackService(db)
                res = await service.sync_slack_messages(cid)
                results.append({"platform": platform, "result": res})
        
        db.close()
        return {"status": "manual_sync_completed", "details": results}

@app.post("/nango/session")
async def create_nango_session(request: Request):
    body = await request.json()
    provider = body.get("provider", "google-mail")
    
    db = SessionLocal()
    nango_secret_entry = db.query(SystemConfig).filter(SystemConfig.key == "NANGO_SECRET_KEY").first()
    db.close()

    nango_secret = nango_secret_entry.value if nango_secret_entry else os.getenv("NANGO_SECRET_KEY")

    if not nango_secret:
        return {"error": "NANGO_SECRET_KEY_MISSING", "status_code": 500}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.nango.dev/connect/sessions",
                headers={"Authorization": f"Bearer {nango_secret}", "Content-Type": "application/json"},
                json={
                    "end_user": {"id": "stefan-primary", "email": "stefan@example.com", "display_name": "Stefan"},
                    "allowed_integrations": [provider]
                }
            )
            data = response.json()
            if response.status_code not in [200, 201]:
                return {"error": "NANGO_API_ERROR", "status_code": response.status_code, "detail": data}
            return data.get("data", data)
        except Exception as e:
            return {"error": "BACKEND_EXCEPTION", "detail": str(e)}

@app.post("/ingest/webhook")
async def nango_webhook(request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()
    db = SessionLocal()
    audit_entry = IngestionAuditLog(
        source_uuid=str(payload.get("connectionId", uuid.uuid4())),
        source_platform=payload.get("providerConfigKey", "unknown"),
        raw_payload=payload,
        status="received"
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    db.close()
    background_tasks.add_task(process_ingestion, str(audit_entry.id))
    return {"status": "audited", "id": str(audit_entry.id)}

from fastapi.responses import StreamingResponse

@app.post("/meeting/positioning")
async def get_positioning(data: MeetingText):
    ds = DeepSeekService()
    advice = "Tip: Pivot to ROI. Remind them of the 2025 premium agreement if they push for a 20% discount."
    async def event_generator():
        for token in advice.split(" "):
            yield f"data: {token} \n\n"
            await asyncio.sleep(0.05)
        yield "data: [DONE]\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
