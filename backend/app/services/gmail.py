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
        """
        # 1. Fetch data from Nango (Gmail integration)
        async with httpx.AsyncClient() as client:
            # CORRECT V2 ENDPOINT: /records?model={sync_id}&connectionId={cid}
            url = f"https://api.nango.dev/records?model={model}&connectionId={connection_id}"
            response = await client.get(
                url,
                headers={
                    "Authorization": f"Bearer {self.nango_secret}",
                    "Accept": "application/json"
                }
            )
            
            if response.status_code != 200:
                print(f"DEBUG: Nango sync error {response.status_code}: {response.text}")
                return {"status": "error", "code": response.status_code, "text": response.text[:200]}
                
            print(f"DEBUG: Nango RAW Response: {response.text[:500]}")
            try:
                data = response.json()
            except Exception as e:
                print(f"DEBUG: JSON parse error: {str(e)}")
                return {"status": "error", "message": "Invalid JSON from Nango", "text": response.text[:200]}
                
            records = data.get("records", [])

        # 2. Process records into threads and messages
        for record in records:
            thread_id = record.get("threadId")
            message_body = record.get("body")
            
            # 3. Check if thread exists, else create
            thread = self.db.query(Thread).filter(Thread.id == thread_id).first()
            if not thread:
                thread = Thread(id=thread_id, title=record.get("subject"))
                self.db.add(thread)
            
            # 4. Trigger Agent (Summarization + Identity + Actions)
            sender_info = {
                "email": record.get("from_email"),
                "name": record.get("from_name")
            }
            
            await self.agent.run(
                thread_id=thread_id,
                message=message_body,
                current_summary=thread.rolling_summary or {},
                sender_info=sender_info
            )
            
            # 5. Save message
            msg = Message(
                id=record.get("id"),
                thread_id=thread_id,
                source="gmail",
                raw_content=message_body,
                timestamp=datetime.fromisoformat(record.get("date").replace('Z', '+00:00'))
            )
            self.db.add(msg)
        
        self.db.commit()
        return {"status": "success", "processed_records": len(records)}


