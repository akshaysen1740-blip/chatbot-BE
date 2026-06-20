
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- Documents Table
-- Stores metadata about uploaded documents
-- =====================================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY,
    filename TEXT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Chunks Table
-- Stores document chunks along with their embeddings
-- =====================================================

CREATE TABLE IF NOT EXISTS chunks (
    id UUID PRIMARY KEY,

    document_id UUID NOT NULL
        REFERENCES documents(id)
        ON DELETE CASCADE,

    chunk_index INT NOT NULL,

    page_number INT,

    content TEXT NOT NULL,

    embedding VECTOR(1536)
);

-- =====================================================
-- HNSW Index for Fast Cosine Similarity Search
-- =====================================================

CREATE INDEX IF NOT EXISTS chunks_embedding_idx
ON chunks
USING hnsw (embedding vector_cosine_ops);
