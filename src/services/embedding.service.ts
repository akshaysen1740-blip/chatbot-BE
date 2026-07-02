import "dotenv/config";
import OpenAI from "openai";
import { OllamaEmbeddingProvider } from "../providers/ollama-embedding.provider";
import aiClient from "../config/gemini.client";
import {
  generateEmbeddingsGemini,
  generateEmbeddingsGeminiMultiple,
} from "../providers/geminiEmbeddingProvider";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_API_KEY. Add it to your .env before using document embeddings.",
    );
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

/**
 * Generates an embedding for the given text.
 *
 * @param text - The input text to embed
 * @returns Promise<number[]> - The embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await getOpenAIClient().embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    throw new Error("Embedding generation failed.");
  }
}

/**
 * Generate embeddings for multiple texts in a single API call.
 * This is much faster and cheaper than calling one by one.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    // const provider = new OllamaEmbeddingProvider();
    // const embedding = await provider.embedMany(texts);
    const embeddings = generateEmbeddingsGeminiMultiple(texts);
    console.log("embedding", embeddings);
    return embeddings;
  } catch (error) {
    console.error("Failed to generate embeddings:", error);
    throw new Error("Batch embedding generation failed.");
  }
}
