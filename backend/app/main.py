from fastapi import FastAPI, BackgroundTasks, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
import httpx
from app.services.deepseek import DeepSeekService
from app.services.ingestion import process_ingestion
from app.models import get_db_engine, IngestionAuditLog, init_db, SessionLocal, SystemConfig, Playbook
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

@app.get("/nango/integrations")
async def list_nango_integrations():
    """
    Diagnostic endpoint to find which integration IDs are valid.
    """
    db = SessionLocal()
    nango_secret_entry = db.query(SystemConfig).filter(SystemConfig.key == "NANGO_SECRET_KEY").first()
    db.close()
    nango_secret = nango_secret_entry.value if nango_secret_entry else os.getenv("NANGO_SECRET_KEY")
    
    if not nango_secret:
        return {"error": "NANGO_SECRET_KEY_MISSING"}
        
    async with httpx.AsyncClient() as client:
        test_ids = ["google", "google-gmail", "gmail", "gmail-sync", "slack", "slack-messages"]
        results = {}
        for tid in test_ids:
            try:
                # Try to create a session for each ID to see if Nango accepts it
                resp = await client.post(
                    "https://api.nango.dev/connect/sessions",
                    headers={"Authorization": f"Bearer {nango_secret}", "Content-Type": "application/json"},
                    json={
                        "end_user": {"id": "test-id"},
                        "allowed_integrations": [tid]
                    }
                )
                results[tid] = resp.status_code
                if resp.status_code == 200:
                    logger.info(f"[Compass] SUCCESS for ID: {tid}")
                else:
                    logger.info(f"[Compass] FAIL for ID: {tid} - {resp.text}")
            except Exception as e:
                results[tid] = str(e)
        return results

@app.post("/nango/session")
async def create_nango_session(request: Request):
    """
    Creates a Nango Connect Session token.
    Accepts 'provider' in request body to specify which integration to allow.
    """
    body = await request.json()
    provider = body.get("provider", "google-gmail")  # Default to Gmail
    
    logger.info(f"[Compass] Nango session request received for provider: {provider}")
    
    db = SessionLocal()
    nango_secret_entry = db.query(SystemConfig).filter(SystemConfig.key == "NANGO_SECRET_KEY").first()
    db.close()

    nango_secret = nango_secret_entry.value if nango_secret_entry else os.getenv("NANGO_SECRET_KEY")

    if not nango_secret:
        logger.error("[Compass] NANGO_SECRET_KEY missing from DB and env")
        return {
            "error": "NANGO_SECRET_KEY_MISSING",
            "detail": "NANGO_SECRET_KEY not found in database (system_config) or environment variables.",
            "status_code": 500
        }
    
    async with httpx.AsyncClient() as client:
        try:
            logger.info(f"[Compass] Calling Nango API for session token (provider: {provider})")
            logger.info(f"[Compass] Nango request payload: {{'provider': '{provider}', 'secret_prefix': '{nango_secret[:10] if nango_secret else None}'}}")
            response = await client.post(
                "https://api.nango.dev/connect/sessions",
                headers={
                    "Authorization": f"Bearer {nango_secret}",
                    "Content-Type": "application/json"
                },
                json={
                    "end_user": {
                        "id": "stefan-primary",
                        "email": "stefan@example.com",
                        "display_name": "Stefan"
                    },
                    "allowed_integrations": [provider]
                }
            )
            
            data = response.json()
            logger.info(f"[Compass] Nango API status: {response.status_code}")
            logger.info(f"[Compass] Nango response: {data}")
            
            if response.status_code != 200:
                logger.error(f"[Compass] Nango API error: {data}")
                return {
                    "error": "NANGO_API_ERROR",
                    "status_code": response.status_code,
                    "detail": data
                }
            
            logger.info("[Compass] Session token created successfully")
            return data
        except Exception as e:
            logger.exception(f"[Compass] Backend exception during Nango session creation: {e}")
            return {
                "error": "BACKEND_EXCEPTION",
                "detail": str(e)
            }

@app.post("/ingest/webhook")
async def nango_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Endpoint for Nango webhooks. 
    Implements the Reliability Layer by auditing every event.
    """
    payload = await request.json()
    
    # Audit Log Entry
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

    # Process in background
    background_tasks.add_task(process_ingestion, str(audit_entry.id))
    
    return {"status": "audited", "id": str(audit_entry.id)}

from fastapi.responses import StreamingResponse
import asyncio

# ... existing code ...

@app.post("/meeting/positioning")
async def get_positioning(data: MeetingText):
    """
    Strategic Positioning Advice with Playbook Injection & SSE Streaming.
    """
    ds = DeepSeekService()
    
    # Load Founder Playbook
    playbook_content = ""
    if os.path.exists("playbook.md"):
        with open("playbook.md", "r") as f:
            playbook_content = f.read()

    async def event_generator():
        # In production, we'd call ds.client.chat.completions.create(
        #     model=ds.model,
        #     messages=[
        #         {"role": "system", "content": f"You are a strategic meeting coach. Playbook: {playbook_content}"},
        #         {"role": "user", "content": data.text}
        #     ],
        #     stream=True
        # )
        
        # Simulated conflict detection
        advice = "Tip: Pivot to ROI. Remind them of the 2025 premium agreement if they push for a 20% discount."
        
        # Check for playbook conflict (Example: 20% discount vs 10% limit)
        is_conflict = "20%" in data.text and "discount" in data.text.lower()
        if is_conflict:
            yield "data: [CONFLICT] \n\n"
            advice = "WARNING: 20% discount requested! Playbook limit is 10%. Refuse and pivot to ROI."

        for token in advice.split(" "):
            yield f"data: {token} \n\n"
            await asyncio.sleep(0.05)
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

