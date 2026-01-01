import httpx
import os
from sqlalchemy.orm import Session
from ..models import IngestionAuditLog, SessionLocal
from .gmail import GmailService
from .slack import SlackService
import logging

logger = logging.getLogger(__name__)

async def process_ingestion(audit_log_id: str):
    """
    Background task to process a Nango webhook event.
    """
    db = SessionLocal()
    audit_entry = db.query(IngestionAuditLog).filter(IngestionAuditLog.id == audit_log_id).first()
    
    if not audit_entry:
        logger.error(f"Audit entry {audit_log_id} not found.")
        db.close()
        return

    try:
        connection_id = audit_entry.source_uuid
        platform = audit_entry.source_platform
        
        # Determine service based on platform
        if "google-gmail" in platform or "gmail" in platform:
            service = GmailService(db)
            await service.sync_gmail_threads(connection_id)
        elif "slack" in platform:
            service = SlackService(db)
            await service.sync_slack_messages(connection_id)
        else:
            logger.warning(f"Unknown platform: {platform}")
            audit_entry.status = "ignored"
            db.commit()
            db.close()
            return

        audit_entry.status = "processed"
        db.commit()
        logger.info(f"Successfully processed ingestion for {connection_id} on {platform}")

    except Exception as e:
        logger.error(f"Error processing ingestion: {e}")
        audit_entry.status = "failed"
        audit_entry.error_message = str(e)
        db.commit()
    finally:
        db.close()

