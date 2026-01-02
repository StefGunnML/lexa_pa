import httpx
import os
from typing import List, Dict, Any
from app.services.deepseek import DeepSeekService
from app.services.agent import CompassAgent
from app.models import Thread, Message
from datetime import datetime

class GmailService:
    def __init__(self, db_session):
        self.nango_secret = os.getenv("NANGO_SECRET_KEY")
        self.deepseek = DeepSeekService()
        self.agent = CompassAgent()
        self.db = db_session

    async def sync_gmail_threads(self, connection_id: str, model: str = "gmail-sync"):
        """
        Sync threads from Gmail via Nango.
        Tries both Nango v1 and v2 URL patterns to find data.
        """
        records = []
        async with httpx.AsyncClient() as client:
            # TRY V1 PATTERN
            v1_url = f"https://api.nango.dev/sync/records?model={model}&connectionId={connection_id}"
            try:
                res = await client.get(v1_url, headers={"Authorization": f"Bearer {self.nango_secret}", "Accept": "application/json"})
                if res.status_code == 200 and "application/json" in res.headers.get("content-type", ""):
                    records = res.json().get("records", [])
            except:
                pass

            # IF V1 FAILED, TRY V2 PATTERN
            if not records:
                # Nango v2 capitalization rule: model must start with Capital
                model_v2 = model[0].upper() + model[1:] if model else model
                v2_url = f"https://api.nango.dev/records?model={model_v2}&connection_id={connection_id}"
                try:
                    res = await client.get(v2_url, headers={"Authorization": f"Bearer {self.nango_secret}", "Accept": "application/json"})
                    if res.status_code == 200 and "application/json" in res.headers.get("content-type", ""):
                        records = res.json().get("records", [])
                except:
                    pass

        if not records:
            print(f"DEBUG: No records found for model {model} using both v1 and v2")
            return {"status": "no_records_found", "tried_model": model}

        # 2. Process records into threads and messages
        print(f"DEBUG: Found {len(records)} records for model {model}. First record: {str(records[0])[:500]}")
        count = 0
        for record in records:
            try:
                # Nango standard Gmail fields often use 'id', 'body', 'subject'
                thread_id = record.get("threadId") or record.get("id")
                message_body = record.get("body") or record.get("text") or record.get("snippet") or ""
                
                # Check if thread exists, else create
                thread = self.db.query(Thread).filter(Thread.id == thread_id).first()
                if not thread:
                    thread = Thread(id=thread_id, title=record.get("subject", "No Subject"))
                    self.db.add(thread)
                
                # Trigger Agent
                sender_info = {
                    "email": record.get("from_email") or record.get("from", ""),
                    "name": record.get("from_name") or ""
                }
                
                await self.agent.run(
                    thread_id=thread_id,
                    message=message_body,
                    current_summary=thread.rolling_summary or {},
                    sender_info=sender_info
                )
                
                # Save message
                msg_id = record.get("id") or str(uuid.uuid4())
                existing_msg = self.db.query(Message).filter(Message.id == msg_id).first()
                if not existing_msg:
                    msg = Message(
                        id=msg_id,
                        thread_id=thread_id,
                        source="gmail",
                        raw_content=message_body,
                        timestamp=datetime.utcnow() # Fallback
                    )
                    if record.get("date"):
                        try:
                            msg.timestamp = datetime.fromisoformat(record.get("date").replace('Z', '+00:00'))
                        except:
                            pass
                    self.db.add(msg)
                    count += 1
            except Exception as e:
                print(f"Error processing record: {e}")
                continue
        
        self.db.commit()
        return {"status": "success", "processed_records": count}
