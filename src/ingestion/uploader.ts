import { randomUUID } from "crypto";

import pool from "../db/connection";
import { insertChunk } from "../db/vector";
import { parseDocument } from "./parser";
import { chunkText } from "./chunker";
import { generateEmbedding } from "../services/embedding.service";

export async function uploadDocument(
  filePath: string,
  filename: string
) {
  // Generate a unique document ID
  const documentId = randomUUID();

  // 1. Parse the document
  const parsed = await parseDocument(filePath);

  // 2. Save document metadata
  await pool.query(
    `
    INSERT INTO documents (id, filename)
    VALUES ($1, $2)
    `,
    [documentId, filename]
  );

  // 3. Chunk the document
  const chunks = chunkText(parsed.text);

  // 4. Process each chunk
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.content);

    await insertChunk({
      id: randomUUID(),
      documentId,
      chunkIndex: chunk.chunkIndex,
      pageNumber: null, // Can be populated later when page-aware parsing is added
      content: chunk.content,
      embedding,
    });
  }

  return {
    documentId,
    filename,
    totalChunks: chunks.length,
    message: "Document uploaded successfully.",
  };
}
