"""
Direct Gmail API Integration (No Nango)
Handles OAuth flow and email fetching directly from Google.
"""
import httpx
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from urllib.parse import urlencode
from sqlalchemy.orm import Session
from app.models import OAuthToken, Thread, Message
from app.services.agent import CompassAgent
import logging
import base64

logger = logging.getLogger(__name__)

class GmailDirectService:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.agent = CompassAgent()
        
        # OAuth Configuration
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "https://lexa-pa-api-l5lm3.ondigitalocean.app/auth/gmail/callback")
        self.scopes = [
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/userinfo.email"
        ]
    
    def get_authorization_url(self, state: str = "default") -> str:
        """Generate Google OAuth authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": " ".join(self.scopes),
            "access_type": "offline",  # Request refresh token
            "prompt": "consent",  # Force consent screen to ensure refresh token
            "state": state
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": self.redirect_uri,
                    "grant_type": "authorization_code"
                }
            )
            response.raise_for_status()
            return response.json()
    
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh an expired access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "refresh_token": refresh_token,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "grant_type": "refresh_token"
                }
            )
            response.raise_for_status()
            return response.json()
    
    def save_token(self, token_data: Dict[str, Any], user_email: str = None):
        """Save or update OAuth token in database"""
        # Check if token exists
        existing = self.db.query(OAuthToken).filter(
            OAuthToken.provider == "gmail",
            OAuthToken.user_id == "default_user"
        ).first()
        
        expiry = None
        if "expires_in" in token_data:
            expiry = datetime.utcnow() + timedelta(seconds=token_data["expires_in"])
        
        if existing:
            existing.access_token = token_data["access_token"]
            if "refresh_token" in token_data:
                existing.refresh_token = token_data["refresh_token"]
            existing.token_expiry = expiry
            existing.updated_at = datetime.utcnow()
            if user_email:
                existing.metadata = {"email": user_email}
        else:
            new_token = OAuthToken(
                provider="gmail",
                user_id="default_user",
                access_token=token_data["access_token"],
                refresh_token=token_data.get("refresh_token"),
                token_expiry=expiry,
                scopes=self.scopes,
                metadata={"email": user_email} if user_email else {}
            )
            self.db.add(new_token)
        
        self.db.commit()
        logger.info(f"[Compass] Gmail token saved for user: {user_email or 'default'}")
    
    async def get_valid_token(self) -> Optional[str]:
        """Get a valid access token, refreshing if necessary"""
        token_record = self.db.query(OAuthToken).filter(
            OAuthToken.provider == "gmail",
            OAuthToken.user_id == "default_user"
        ).first()
        
        if not token_record:
            logger.warning("[Compass] No Gmail token found in database")
            return None
        
        # Check if token is expired
        if token_record.token_expiry and token_record.token_expiry < datetime.utcnow():
            logger.info("[Compass] Token expired, refreshing...")
            if token_record.refresh_token:
                try:
                    new_token_data = await self.refresh_access_token(token_record.refresh_token)
                    self.save_token(new_token_data)
                    return new_token_data["access_token"]
                except Exception as e:
                    logger.error(f"[Compass] Failed to refresh token: {e}")
                    return None
            else:
                logger.warning("[Compass] Token expired and no refresh token available")
                return None
        
        return token_record.access_token
    
    async def fetch_messages(self, max_results: int = 50) -> List[Dict[str, Any]]:
        """Fetch recent messages from Gmail"""
        access_token = await self.get_valid_token()
        if not access_token:
            raise Exception("No valid Gmail token available. Please reconnect Gmail.")
        
        messages = []
        async with httpx.AsyncClient() as client:
            # List message IDs
            list_response = await client.get(
                "https://gmail.googleapis.com/gmail/v1/users/me/messages",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"maxResults": max_results, "labelIds": "INBOX"}
            )
            list_response.raise_for_status()
            message_list = list_response.json().get("messages", [])
            
            # Fetch full message details
            for msg_ref in message_list[:max_results]:
                msg_id = msg_ref["id"]
                msg_response = await client.get(
                    f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}",
                    headers={"Authorization": f"Bearer {access_token}"},
                    params={"format": "full"}
                )
                msg_response.raise_for_status()
                messages.append(msg_response.json())
        
        logger.info(f"[Compass] Fetched {len(messages)} messages from Gmail")
        return messages
    
    def extract_message_body(self, payload: Dict[str, Any]) -> str:
        """Extract plain text body from Gmail message payload"""
        if "parts" in payload:
            for part in payload["parts"]:
                if part["mimeType"] == "text/plain" and "data" in part["body"]:
                    return base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8")
        elif "body" in payload and "data" in payload["body"]:
            return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8")
        return ""
    
    def get_header(self, headers: List[Dict[str, str]], name: str) -> str:
        """Get a specific header value from message headers"""
        for header in headers:
            if header["name"].lower() == name.lower():
                return header["value"]
        return ""
    
    async def sync_messages(self) -> Dict[str, Any]:
        """Sync messages from Gmail to local database"""
        try:
            messages = await self.fetch_messages(max_results=50)
            processed = 0
            
            for msg in messages:
                msg_id = msg["id"]
                thread_id = msg["threadId"]
                headers = msg["payload"].get("headers", [])
                
                # Extract metadata
                subject = self.get_header(headers, "Subject") or "No Subject"
                from_email = self.get_header(headers, "From")
                from_name = from_email.split("<")[0].strip() if "<" in from_email else from_email
                timestamp_ms = int(msg.get("internalDate", 0))
                timestamp = datetime.fromtimestamp(timestamp_ms / 1000)
                
                # Extract body
                body = self.extract_message_body(msg["payload"])
                
                if not body:
                    logger.debug(f"[Compass] Skipping message {msg_id} - no body content")
                    continue
                
                # Check if message already exists
                existing = self.db.query(Message).filter(Message.id == msg_id).first()
                if existing:
                    continue
                
                # Get or create thread
                thread = self.db.query(Thread).filter(Thread.id == thread_id).first()
                if not thread:
                    thread = Thread(id=thread_id, title=subject)
                    self.db.add(thread)
                
                # Run agent for summarization and entity detection
                sender_info = {"email": from_email, "name": from_name}
                await self.agent.run(
                    thread_id=thread_id,
                    message=body,
                    current_summary=thread.rolling_summary or {},
                    sender_info=sender_info
                )
                
                # Save message
                new_message = Message(
                    id=msg_id,
                    thread_id=thread_id,
                    source="gmail",
                    raw_content=body,
                    timestamp=timestamp
                )
                self.db.add(new_message)
                processed += 1
            
            self.db.commit()
            logger.info(f"[Compass] Successfully processed {processed} new messages")
            return {"status": "success", "processed": processed, "total_fetched": len(messages)}
            
        except Exception as e:
            logger.error(f"[Compass] Error syncing Gmail messages: {e}")
            self.db.rollback()
            raise

