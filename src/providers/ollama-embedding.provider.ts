// providers/ollama-embedding.provider.ts

export class OllamaEmbeddingProvider {
  private readonly baseUrl = "http://localhost:11434";

  async embed(text: string): Promise<number[]> {
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

    const data = await response.json();

    return data.embedding;
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    return Promise.all(
      texts.map((text) => this.embed(text))
    );
  }
}