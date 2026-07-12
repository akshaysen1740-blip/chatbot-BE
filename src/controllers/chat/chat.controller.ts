import { Request, Response } from "express";
import { ApiResponse, ChatApiMessage, ChatRequestBody } from "../../types/chat.types";
import { chatService } from "../../services/chat.service";

export const chat = async (
  req: Request<unknown, unknown, ChatRequestBody>,
  res: Response,
): Promise<Response | void> => {
  try {
    const result = (await chatService.chat(req.body)) as ChatApiMessage;

    const response: ApiResponse<ChatApiMessage> = {
      statusCode: 200,
      status: "success",
      message: "Chat response generated successfully.",
      data: result,
    };

    return res.status(response.statusCode).json(response);
  } catch (error: any) {
    const details = error?.message || error;

    console.error(details);

    const response: ApiResponse<null> = {
      statusCode: 500,
      status: "error",
      message: typeof details === "string" ? details : "Something went wrong",
      data: null,
    };

    return res.status(response.statusCode).json(response);
  }
};

