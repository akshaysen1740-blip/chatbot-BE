import { randomUUID } from "crypto";

import {
  insertChunk,
  searchSimilarChunks,
  ChunkData,
} from "../db/vector";

export interface StoreChunkInput {
  documentId: string;
  chunkIndex: number;
  pageNumber?: number | null;
  content: string;
  embedding: number[];
}

export class VectorService {
  /**
   * Store a single chunk in the vsector database.
   */
  async storeChunk(chunk: StoreChunkInput): Promise<void> {
    const chunkData: ChunkData = {
      id: randomUUID(),
      documentId: chunk.documentId,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber ?? null,
      content: chunk.content,
      embedding: chunk.embedding,
    };

    await insertChunk(chunkData);
  }

  /**
   * Store multiple chunks.
   */
  async storeChunks(chunks: StoreChunkInput[]): Promise<void> {
    for (const chunk of chunks) {
      await this.storeChunk(chunk);
    }
  }

  /**
   * Search for semantically similar chunks.
   */
  async search(
    queryEmbedding: number[],
    limit: number = 5
  ) {
    return await searchSimilarChunks(queryEmbedding, limit);
  }
}

export const vectorService = new VectorService();
