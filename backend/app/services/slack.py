import httpx
import os
from typing import List, Dict, Any
from .deepseek import DeepSeekService
from ..models import Thread, Message
from datetime import datetime

class SlackService:
    def __init__(self, db_session):
        self.nango_secret = os.getenv("NANGO_SECRET_KEY")
        self.deepseek = DeepSeekService()
        self.db = db_session

    async def sync_slack_messages(self, connection_id: str):
        """
        Sync messages from Slack via Nango.
        """
        # 1. Fetch data from Nango (Slack integration)
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.nango.dev/sync/slack-messages/records?connectionId={connection_id}",
                headers={"Authorization": f"Bearer {self.nango_secret}"}
            )
            records = response.json().get("records", [])

        # 2. Process records into threads and messages
        for record in records:
            # Slack uses channel ID + ts as thread reference usually
            channel_id = record.get("channel_id")
            thread_ts = record.get("thread_ts") or record.get("ts")
            thread_id = f"SLACK-{channel_id}-{thread_ts}"
            message_body = record.get("text")
            
            # 3. Check if thread exists, else create
            thread = self.db.query(Thread).filter(Thread.id == thread_id).first()
            if not thread:
                thread = Thread(id=thread_id, title=f"Slack Thread: {channel_id}")
                self.db.add(thread)
            
            # 4. Update Rolling Summary
            new_summary = await self.deepseek.summarize_thread(thread.rolling_summary or {}, message_body)
            thread.rolling_summary = new_summary
            thread.last_updated = datetime.utcnow()
            
            # 5. Save message
            msg = Message(
                id=record.get("id"),
                thread_id=thread_id,
                source="slack",
                raw_content=message_body,
                timestamp=datetime.fromtimestamp(float(record.get("ts")))
            )
            self.db.add(msg)
        
        self.db.commit()
        return {"status": "success", "processed_records": len(records)}
