export interface Chunk {
  chunkIndex: number;
  content: string;
}

/**
 * Splits text into overlapping chunks.
 *
 * @param text - The full document text
 * @param chunkSize - Maximum characters per chunk
 * @param overlap - Number of overlapping characters
 * @returns Array of chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): Chunk[] {
  if (overlap >= chunkSize) {
    throw new Error("Overlap must be smaller than chunkSize.");
  }

  const chunks: Chunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);

    chunks.push({
      chunkIndex,
      content: text.slice(start, end).trim(),
    });

    start += chunkSize - overlap;
    chunkIndex++;
  }

  return chunks;
}
