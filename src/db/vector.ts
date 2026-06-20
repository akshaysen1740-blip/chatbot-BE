import pool from "./connection";
import pgvector from "pgvector/pg";

export interface ChunkData {
  id: string;
  documentId: string;
  chunkIndex: number;
  pageNumber: number | null;
  content: string;
  embedding: number[];
}

/**
 * Insert a document chunk along with its embedding.
 */
export async function insertChunk(chunk: ChunkData) {
  const query = `
    INSERT INTO chunks (
      id,
      document_id,
      chunk_index,
      page_number,
      content,
      embedding
    )
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

  await pool.query(query, [
    chunk.id,
    chunk.documentId,
    chunk.chunkIndex,
    chunk.pageNumber,
    chunk.content,
    pgvector.toSql(chunk.embedding),
  ]);
}

/**
 * Search for the most similar chunks using cosine distance.
 */
export async function searchSimilarChunks(
  embedding: number[],
  limit: number = 5
) {
  const query = `
    SELECT
      id,
      document_id,
      chunk_index,
      page_number,
      content,
      embedding <=> $1 AS distance
    FROM chunks
    ORDER BY embedding <=> $1
    LIMIT $2;
  `;

  const { rows } = await pool.query(query, [
    pgvector.toSql(embedding),
    limit,
  ]);

  return rows;
}
