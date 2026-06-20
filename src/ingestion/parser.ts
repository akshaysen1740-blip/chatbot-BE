import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";

export interface ParsedDocument {
  text: string;
  pageCount?: number;
}

/**
 * Extract text from a supported document.
 */
export async function parseDocument(
  filePath: string,
  originalFilename?: string,
): Promise<ParsedDocument> {
  const extension = path
    .extname(originalFilename ?? filePath)
    .toLowerCase();

  switch (extension) {
    case ".txt":
      return parseTxt(filePath);

    case ".pdf":
      return parsePdf(filePath);

    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

/**
 * Parse a plain text file.
 */
async function parseTxt(filePath: string): Promise<ParsedDocument> {
  const text = await fs.readFile(filePath, "utf-8");

  return {
    text,
  };
}

/**
 * Parse a PDF file.
 */
async function parsePdf(filePath: string): Promise<ParsedDocument> {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });

  try {
    const data = await parser.getText();

    return {
      text: data.text,
      pageCount: data.total,
    };
  } finally {
    await parser.destroy();
  }
}
