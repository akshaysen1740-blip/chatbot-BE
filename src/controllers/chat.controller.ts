import axios from "axios";
import { Request, Response } from "express";

export const chatController = async (req: Request, res: Response) => {
  const api_url = process.env.OPENROUTER_API_URL!;
  const api_key = process.env.OPENROUTER_API_KEY!;
  const rawMessages = req.body?.messages;

  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return res.status(400).json({
      error: "messages must be a non-empty array",
    });
  }
  try {
    const messages = rawMessages.map((message: IncomingMessage, index: number) => {
      const content = message.content ?? message.message;

      if (!message.role || !content) {
        return null;
      }

      return {
        role: message.role,
        content,
      };
    });

    if (messages.some((message) => message === null)) {
      return res.status(400).json({
        error: "Each message must include role and content or message",
      });
    }

    console.log(messages, "messages");

    const systemPrompt = {
      role: "system",
      content: `
        You are a helpful assistant.
        `,
    };
    const response = await axios.post(
      api_url,
      {
        model: "openrouter/owl-alpha",
        temperature: 1.0,
        max_tokens: 200,
        messages: [systemPrompt, ...messages],
      },
      {
        headers: {
          Authorization: `Bearer ${api_key}`,
          "Content-Type": "application/json",
        },
      },
    );
    // const formatedRes = JSON.parse(response.data.choices[0].message.content);
    // console.log(formatedRes)
    res.json(response.data.choices[0]);
  } catch (error: any) {
    const details = error.response?.data || error.message;
    console.log(details);

    res.status(error.response?.status || 500).json({
      error: "Something  wrong",
      details,
    });
  }
};

type IncomingMessage = {
  role: string;
  content?: string;
  message?: string;
};

type Messages = {
  role: string;
  content: string;
};
