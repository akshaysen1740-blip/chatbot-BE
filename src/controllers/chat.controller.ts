import { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import { ChatRequestBody } from "../types/chat.types";

export const chat = async (
  req: Request<unknown, unknown, ChatRequestBody>,
  res: Response,
): Promise<Response | void> => {
  try {
    const result = await chatService.chat(req.body);

    return res.json(result);
  } catch (error: any) {
    const details = error?.message || error;

    console.error(details);

    return res.status(500).json({
      error: "Something went wrong",
      details,
    });
  }
};

