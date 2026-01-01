import httpx
import os
from typing import List, Dict, Any
from app.services.deepseek import DeepSeekService
from app.models import Thread, Message
from datetime import datetime

class GmailService:
    def __init__(self, db_session):
        self.nango_secret = os.getenv("NANGO_SECRET_KEY")
        self.deepseek = DeepSeekService()
        self.db = db_session

    async def sync_gmail_threads(self, connection_id: str):
        """
        Sync threads from Gmail via Nango.
        """
        # 1. Fetch data from Nango (Gmail integration)
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.nango.dev/sync/gmail-sync/records?connectionId={connection_id}",
                headers={"Authorization": f"Bearer {self.nango_secret}"}
            )
            records = response.json().get("records", [])

        # 2. Process records into threads and messages
        for record in records:
            thread_id = record.get("threadId")
            message_body = record.get("body")
            
            # 3. Check if thread exists, else create
            thread = self.db.query(Thread).filter(Thread.id == thread_id).first()
            if not thread:
                thread = Thread(id=thread_id, title=record.get("subject"))
                self.db.add(thread)
            
            # 4. Update Rolling Summary
            new_summary = await self.deepseek.summarize_thread(thread.rolling_summary or {}, message_body)
            thread.rolling_summary = new_summary
            thread.last_updated = datetime.utcnow()
            
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


