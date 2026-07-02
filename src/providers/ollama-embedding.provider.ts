// providers/ollama-embedding.provider.ts

export class OllamaEmbeddingProvider {
  private readonly baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";

  async embed(text: string): Promise<number[]> {
    if (!text.trim()) {
      throw new Error("Cannot generate an embedding for an empty query");
    }

    const response = await fetch(
      `${this.baseUrl}/api/embeddings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nomic-embed-text",
          prompt: text,
        }),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Ollama embedding request failed with ${response.status}: ${details}`
      );
    }

    const data = await response.json();
    if (!Array.isArray(data.embedding)) {
      throw new Error("Ollama did not return a valid embedding array");
    }

    return data.embedding;
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    return Promise.all(
      texts.map((text) => this.embed(text))
    );
  }
}
