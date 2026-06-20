import { randomUUID } from "crypto";
import pool from "../db/connection";
import { parseDocument } from "../ingestion/parser";
import { chunkText } from "../ingestion/chunker";
import { generateEmbeddings } from "./embedding.service";
import { vectorService } from "./vector.service";

export interface Document {
  id: string;
  filename: string;
  uploaded_at: Date;
}

class DocumentService {
  
  async createDocument(filename: string): Promise<string> {
    const documentId = randomUUID();

    await pool.query(
      `
      INSERT INTO documents (id, filename)
      VALUES ($1, $2)
      `,
      [documentId, filename]
    );

    return documentId;
  }

  /**
   * Get a document by its ID.
   */
  async getDocumentById(
    documentId: string
  ): Promise<Document | null> {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM documents
      WHERE id = $1
      `,
      [documentId]
    );

    return rows.length ? rows[0] : null;
  }

  /**
   * List all uploaded documents.
   */
  async getAllDocuments(): Promise<Document[]> {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM documents
      ORDER BY uploaded_at DESC
      `
    );

    return rows;
  }

  /**
   * Delete a document.
   */
  async deleteDocument(documentId: string): Promise<void> {
    await pool.query(
      `
      DELETE FROM documents
      WHERE id = $1
      `,
      [documentId]
    );
  }

  /**
   * Upload document → Parse → Chunk → Embed → Store in Vector DB
   */
  async upload(filePath: string, filename: string) {
    const documentId = await this.createDocument(filename);

    const parsed = await parseDocument(filePath, filename);

    const chunks = chunkText(parsed.text);

    const embeddings = await generateEmbeddings(
      chunks.map((chunk) => chunk.content)
    );

    await vectorService.storeChunks(
      chunks.map((chunk, index) => ({
        documentId,
        chunkIndex: chunk.chunkIndex,
        pageNumber: null,
        content: chunk.content,
        embedding: embeddings[index],
      }))
    );

    return {
      documentId,
      filename,
      totalChunks: chunks.length,
    };
  }
}

export const documentService = new DocumentService();
