import { randomUUID } from "crypto";

import { insertChunk, searchSimilarChunks, ChunkData } from "../db/vector";
import { OllamaEmbeddingProvider } from "../providers/ollama-embedding.provider";
import aiClient from "../config/gemini.client";

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
  async search(query: string, limit = 5) {
    try {
      // const provider = new OllamaEmbeddingProvider();
      // const queryEmbedding = await provider.embed(query);

      const response = await aiClient.models.embedContent({
        model: "gemini-embedding-001",
        contents: query,
        config: {
          outputDimensionality: 768,
        },
      });

      console.log("response", response.embeddings);
      return searchSimilarChunks(
        response.embeddings
          ? response.embeddings[0].values
            ? response.embeddings[0].values
            : []
          : [],
        limit,
      );
    } catch (error: any) {
      console.error(error);
      return [];
    }
  }
}

export const vectorService = new VectorService();
