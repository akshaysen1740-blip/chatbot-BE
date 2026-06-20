import { Request, Response } from "express";
import { vectorService } from "../services/vector.service";

interface SearchRequestBody {
  query?: string;
  limit?: number;
}

export async function search(
  req: Request<unknown, unknown, SearchRequestBody>,
  res: Response,
): Promise<Response | void> {
  const query = req.body?.query?.trim();
  const limit = req.body?.limit;

  if (!query) {
    return res.status(400).json({
      error: "query is required",
    });
  }

  if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
    return res.status(400).json({
      error: "limit must be a positive integer",
    });
  }

  try {
    const results = await vectorService.search(query, limit);

    return res.json(results);
  } catch (error: any) {
    const details = error?.message || "Unknown search error";
    console.error("Search failed:", error);

    return res.status(500).json({
      error: "Search failed",
      details,
    });
  }
}
