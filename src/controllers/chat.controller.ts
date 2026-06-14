import { GoogleGenAI } from "@google/genai";
import { Request, Response } from "express";
import { env } from "../config/env";
import { ChatApiMessage, ChatRequestBody, GeminiMessage, IncomingMessage } from "../types/chat.types";

const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

function normalizeIncomingMessage(
  message: IncomingMessage,
): ChatApiMessage | null {
  const content = (message.content ?? message.message)?.trim();

  if (!message.role || !content) {
    return null;
  }

  if (message.role !== "user" && message.role !== "assistant") {
    return null;
  }

  return {
    role: message.role,
    content,
  };
}

function toGeminiRole(role: string): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

function toGeminiMessages(messages: ChatApiMessage[]): GeminiMessage[] {
  return messages.map((message) => ({
    role: toGeminiRole(message.role),
    parts: [{ text: message.content }],
  }));
}

const assistantSystemInstruction = "You are a helpful assistant.";

const summarySystemInstruction = `
You summarize earlier conversation turns for continued context.
Return only valid JSON with this exact shape:
{
  "role": "user",
  "content": "Concise summary of the earlier conversation"
}
Do not wrap the JSON in markdown and do not add extra text.
`;

async function summarizeMessages(
  messages: ChatApiMessage[],
): Promise<ChatApiMessage> {
  const messagesForSummary = messages.slice(0, -10);
  const conversationSummary = await ai.models.generateContent({
    model: env.geminiModel,
    contents: toGeminiMessages(messagesForSummary),
    config: {
      systemInstruction: summarySystemInstruction,
      temperature: 0.2,
      maxOutputTokens: 200,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          role: { type: "string" },
          content: { type: "string" },
        },
        required: ["role", "content"],
      },
    },
  });

  const summaryText = conversationSummary.text;
  if (!summaryText) {
    throw new Error("Gemini returned an empty summary response");
  }

  const summary = JSON.parse(summaryText) as ChatApiMessage;

  return {
    role: summary.role || "user",
    content: summary.content,
  };
}

export const chat = async (
  req: Request<unknown, unknown, ChatRequestBody>,
  res: Response,
): Promise<Response | void> => {
  const rawMessages = req.body?.messages;

  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return res.status(400).json({
      error: "messages must be a non-empty array",
    });
  }
  try {
    const normalizedMessages = rawMessages.map(normalizeIncomingMessage);
    const invalidMessages = normalizedMessages.filter(
      (message) => message === null,
    ).length;

    if (invalidMessages === rawMessages.length) {
      return res.status(400).json({
        error:
          "Each message must include a user or assistant role and content or message",
      });
    }

    const messages = normalizedMessages.filter(
      (message): message is ChatApiMessage => message !== null,
    );

    if (messages.length === 0) {
      return res.status(400).json({
        error: "No valid user or assistant messages were provided",
      });
    }

    const conversationMessages =
      messages.length > 20
        ? [await summarizeMessages(messages), ...messages.slice(-10)]
        : messages;

    console.log(conversationMessages);

    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents: toGeminiMessages(conversationMessages),
      config: {
        temperature: 0.9,
        systemInstruction: assistantSystemInstruction,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty chat response");
    }

    res.json({
      message: {
        role: "assistant",
        content: text,
      },
      choices: [
        {
          message: {
            role: "assistant",
            content: text,
          },
        },
      ],
    });
  } catch (error: any) {
    const details = error?.message || error;
    console.log(details);

    res.status(500).json({
      error: "Something went wrong",
      details,
    });
  }
};
