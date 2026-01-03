from sqlalchemy import create_engine, Column, String, Text, DateTime, JSON, ForeignKey, Table, Float, text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import os
from datetime import datetime
import uuid

Base = declarative_base()

class Entity(Base):
    __tablename__ = 'entities'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True)
    phone = Column(String, unique=True)
    slack_id = Column(String, unique=True)
    whatsapp_id = Column(String, unique=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class Thread(Base):
    __tablename__ = 'threads'
    id = Column(String, primary_key=True)
    title = Column(String)
    rolling_summary = Column(JSONB, default={})
    last_updated = Column(DateTime(timezone=True), default=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    messages = relationship("Message", back_populates="thread")

class Message(Base):
    __tablename__ = 'messages'
    id = Column(String, primary_key=True)
    thread_id = Column(String, ForeignKey('threads.id'))
    entity_id = Column(UUID(as_uuid=True), ForeignKey('entities.id'))
    source = Column(String, nullable=False)
    raw_content = Column(Text)
    cleaned_content = Column(Text)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    thread = relationship("Thread", back_populates="messages")

class Meeting(Base):
    __tablename__ = 'meetings'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    transcript = Column(Text)
    action_items = Column(JSONB, default=[])
    positioning_notes = Column(Text)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class PendingAction(Base):
    __tablename__ = 'pending_actions'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String, nullable=False)
    data = Column(JSONB, nullable=False)
    status = Column(String, default='pending')
    confidence_score = Column(Float, default=1.0)
    source_link = Column(String)
    thread_id = Column(String, ForeignKey('threads.id'))
    meeting_id = Column(UUID(as_uuid=True), ForeignKey('meetings.id'))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class IngestionAuditLog(Base):
    __tablename__ = 'ingestion_audit_log'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_uuid = Column(String, nullable=False)
    source_platform = Column(String, nullable=False)
    raw_payload = Column(JSONB)
    status = Column(String, default='received')
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class SystemConfig(Base):
    __tablename__ = 'system_config'
    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)
    description = Column(String)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class Playbook(Base):
    __tablename__ = 'playbook'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class OAuthToken(Base):
    __tablename__ = 'oauth_tokens'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider = Column(String, nullable=False)  # 'gmail', 'slack', etc.
    user_id = Column(String, default='default_user')  # For future multi-user support
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text)
    token_expiry = Column(DateTime(timezone=True))
    scopes = Column(JSONB, default=[])
    metadata = Column(JSONB, default={})  # Store email, name, etc.
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

# Note: pgvector specific columns and indexes are best handled via raw SQL or specialized extensions
# like pgvector-python. For this scaffold, we'll stick to basic SQLAlchemy.

def get_db_engine():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL not set")
    return create_engine(db_url)

engine = get_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    engine = get_db_engine()
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    Base.metadata.create_all(engine)
    print("Database tables created.")

if __name__ == "__main__":
    # This would be run to initialize tables
    # init_db()
    pass


