import httpx
import os
from typing import List, Dict, Any
from app.services.deepseek import DeepSeekService
from app.services.agent import CompassAgent
from app.models import Thread, Message
from datetime import datetime

class SlackService:
    def __init__(self, db_session):
        self.nango_secret = os.getenv("NANGO_SECRET_KEY")
        self.deepseek = DeepSeekService()
        self.agent = CompassAgent()
        self.db = db_session

    async def sync_slack_messages(self, connection_id: str):
        """
        Sync messages from Slack via Nango.
        """
        # 1. Fetch data from Nango (Slack integration)
        async with httpx.AsyncClient() as client:
            # CORRECT V2 ENDPOINT: /records?model={sync_id}&connection_id={cid}
            url = f"https://api.nango.dev/records?model=slack-messages&connection_id={connection_id}"
            response = await client.get(
                url,
                headers={
                    "Authorization": f"Bearer {self.nango_secret}",
                    "Accept": "application/json"
                }
            )
            
            if response.status_code != 200:
                return {"status": "error", "code": response.status_code, "text": response.text[:200]}
                
            try:
                data = response.json()
            except Exception:
                return {"status": "error", "message": "Invalid JSON from Nango"}
                
            records = data.get("records", [])

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
            
            # 4. Trigger Agent (Summarization + Identity + Actions)
            sender_info = {
                "slack_id": record.get("user_id"),
                "name": record.get("user_name")
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
                source="slack",
                raw_content=message_body,
                timestamp=datetime.fromtimestamp(float(record.get("ts")))
            )
            self.db.add(msg)
        
        self.db.commit()
        return {"status": "success", "processed_records": len(records)}
