from fastapi import FastAPI, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from app.services.deepseek import DeepSeekService
from app.services.ingestion import process_ingestion
from app.models import get_db_engine, IngestionAuditLog
from sqlalchemy.orm import sessionmaker
import asyncio
import os
import uuid

app = FastAPI(title="Project Compass API")

# Setup Database Session
engine = get_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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

