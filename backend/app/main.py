from fastapi import FastAPI, BackgroundTasks, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn
import httpx
from app.services.deepseek import DeepSeekService
from app.services.ingestion import process_ingestion
from app.services.gmail_direct import GmailDirectService
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

@app.get("/nango/debug-all-syncs")
async def debug_all_nango_syncs():
    db = SessionLocal()
    nango_secret_entry = db.query(SystemConfig).filter(SystemConfig.key == "NANGO_SECRET_KEY").first()
    db.close()
    nango_secret = nango_secret_entry.value if nango_secret_entry else os.getenv("NANGO_SECRET_KEY")
    
    endpoints = [
        "https://api.nango.dev/sync/configurations",
        "https://api.nango.dev/sync-configs",
        "https://api.nango.dev/sync/status",
        "https://api.nango.dev/sync/definitions"
    ]
    
    results = {}
    async with httpx.AsyncClient() as client:
        for url in endpoints:
            try:
                res = await client.get(url, headers={"Authorization": f"Bearer {nango_secret}", "Accept": "application/json"})
                results[url] = {
                    "status": res.status_code,
                    "data": res.json() if res.status_code == 200 else res.text[:200]
                }
            except Exception as e:
                results[url] = str(e)
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
                # Try multiple possible model names for Gmail
                for model in ["Message", "Thread", "gmail-sync", "emails", "google-mail"]:
                    res = await service.sync_gmail_threads(cid, model=model)
                    results.append({"platform": platform, "model": model, "result": res})
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

@app.get("/nango/debug-db")
async def debug_nango_db():
    db = SessionLocal()
    logs = db.query(IngestionAuditLog).order_by(IngestionAuditLog.created_at.desc()).limit(10).all()
    db.close()
    return {"logs": [{"platform": l.source_platform, "status": l.status} for l in logs]}

@app.get("/nango/debug-connections")
async def debug_nango_connections():
    db = SessionLocal()
    nango_secret_entry = db.query(SystemConfig).filter(SystemConfig.key == "NANGO_SECRET_KEY").first()
    db.close()
    nango_secret = nango_secret_entry.value if nango_secret_entry else os.getenv("NANGO_SECRET_KEY")
    async with httpx.AsyncClient() as client:
        res = await client.get("https://api.nango.dev/connection", headers={"Authorization": f"Bearer {nango_secret}"})
        return res.json()

# ============================================
# DIRECT GMAIL OAUTH (NO NANGO)
# ============================================

@app.get("/auth/gmail/start")
async def start_gmail_oauth():
    """Initiate Gmail OAuth flow"""
    db = SessionLocal()
    gmail_service = GmailDirectService(db)
    auth_url = gmail_service.get_authorization_url()
    db.close()
    logger.info(f"[Compass] Redirecting to Gmail OAuth: {auth_url}")
    return RedirectResponse(url=auth_url)

@app.get("/auth/gmail/callback")
async def gmail_oauth_callback(code: str, state: str = "default"):
    """Handle Gmail OAuth callback"""
    db = SessionLocal()
    gmail_service = GmailDirectService(db)
    
    try:
        # Exchange code for token
        token_data = await gmail_service.exchange_code_for_token(code)
        
        # Get user email
        user_email = "default@compass.com"
        async with httpx.AsyncClient() as client:
            user_info_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            if user_info_response.status_code == 200:
                user_info = user_info_response.json()
                user_email = user_info.get("email", user_email)
        
        # Save token
        gmail_service.save_token(token_data, user_email)
        
        # Redirect to frontend settings page with success
        frontend_url = os.getenv("FRONTEND_URL", "https://lexa-pa-2rwqf.ondigitalocean.app")
        db.close()
        return RedirectResponse(url=f"{frontend_url}/dashboard/settings?gmail=connected")
        
    except Exception as e:
        logger.error(f"[Compass] Gmail OAuth callback error: {e}")
        db.close()
        frontend_url = os.getenv("FRONTEND_URL", "https://lexa-pa-2rwqf.ondigitalocean.app")
        return RedirectResponse(url=f"{frontend_url}/dashboard/settings?gmail=error")

@app.post("/gmail/sync")
async def sync_gmail():
    """Manually sync Gmail messages"""
    db = SessionLocal()
    gmail_service = GmailDirectService(db)
    
    try:
        result = await gmail_service.sync_messages()
        db.close()
        return result
    except Exception as e:
        logger.error(f"[Compass] Gmail sync error: {e}")
        db.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/gmail/status")
async def gmail_connection_status():
    """Check if Gmail is connected"""
    db = SessionLocal()
    gmail_service = GmailDirectService(db)
    
    try:
        token = await gmail_service.get_valid_token()
        db.close()
        if token:
            return {"status": "connected", "has_token": True}
        else:
            return {"status": "disconnected", "has_token": False}
    except Exception as e:
        db.close()
        return {"status": "error", "has_token": False, "error": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
