import { Response } from "express";

type ErrorDetails = unknown;

export function sendError(
  res: Response,
  statusCode: number,
  error: string,
  details?: ErrorDetails,
): Response {
  return res.status(statusCode).json({
    error,
    ...(details !== undefined ? { details } : {}),
  });
}
