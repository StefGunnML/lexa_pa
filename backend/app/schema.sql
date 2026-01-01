-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Entities table (Merging identities across platforms)
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    slack_id TEXT UNIQUE,
    whatsapp_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Threads table (Thread-First Data Model)
CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY, -- thread_id from source (e.g., Gmail threadId)
    title TEXT,
    rolling_summary JSONB DEFAULT '{}',
    summary_vector vector(1536), -- Assuming 1536 dimensions for embeddings (OpenAI/DeepSeek standard)
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, -- message_id from source
    thread_id TEXT REFERENCES threads(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id),
    source TEXT NOT NULL, -- 'gmail', 'slack', 'whatsapp'
    raw_content TEXT,
    cleaned_content TEXT,
    message_vector vector(1536),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    transcript TEXT,
    action_items JSONB DEFAULT '[]',
    positioning_notes TEXT,
    meeting_vector vector(1536),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PendingActions table (Human-in-the-Loop)
CREATE TABLE IF NOT EXISTS pending_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'email_draft', 'calendar_invite', 'slack_reply'
    data JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    confidence_score FLOAT DEFAULT 1.0,
    source_link TEXT,
    thread_id TEXT REFERENCES threads(id),
    meeting_id UUID REFERENCES meetings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ingestion Audit Log for reliability
CREATE TABLE IF NOT EXISTS ingestion_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_uuid TEXT NOT NULL, -- UUID from incoming webhook (e.g., Nango/Gmail messageId)
    source_platform TEXT NOT NULL,
    raw_payload JSONB,
    status TEXT DEFAULT 'received', -- 'received', 'processed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for vector search
CREATE INDEX IF NOT EXISTS threads_vector_idx ON threads USING ivfflat (summary_vector l2_distance) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS messages_vector_idx ON messages USING ivfflat (message_vector l2_distance) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS meetings_vector_idx ON meetings USING ivfflat (meeting_vector l2_distance) WITH (lists = 100);


