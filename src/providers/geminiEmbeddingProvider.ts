import aiClient from "../config/gemini.client";

export async function generateEmbeddingsGemini(
  text: string,
): Promise<number[]> {
  const response = await aiClient.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings
    ? response.embeddings[0].values
      ? response.embeddings[0].values
      : []
    : [];
}

export async function generateEmbeddingsGeminiMultiple(
  texts: string[],
): Promise<number[][]> {
  const response = await aiClient.models.embedContent({
    model: "gemini-embedding-001",
    contents: texts,
    config: {
      outputDimensionality: 768,
    },
  });

  if (!response.embeddings) return [];
  return response.embeddings.map((embedding) => embedding.values ?? []);
}
