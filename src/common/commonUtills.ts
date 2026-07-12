import { env } from "../config/env";
import aiClient from "../config/gemini.client";
import { getSummarPrompt } from "../prompts/system.prompts";
import { ChatApiMessage, GeminiMessage, IncomingMessage } from "../types/chat.types";

export function normalizeIncomingMessage(
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

export async function summarizeMessages(
  messages: ChatApiMessage[],
): Promise<ChatApiMessage> {
  const messagesForSummary = messages.slice(0, -10);

  const response = await aiClient.models.generateContent({
    model: env.geminiModel,
    contents: toGeminiMessages(messagesForSummary),
    config: {
      systemInstruction: getSummarPrompt(),
      temperature: 0.2,
      maxOutputTokens: 200,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          role: {
            type: "string",
          },
          content: {
            type: "string",
          },
        },
        required: ["role", "content"],
      },
    },
  });

  const summaryText = response.text;

  if (!summaryText) {
    throw new Error("Gemini returned an empty summary response");
  }

  const summary = JSON.parse(summaryText) as ChatApiMessage;

  return {
    role: summary.role || "user",
    content: summary.content || summaryText,
  };
}

export function toGeminiMessages(messages: ChatApiMessage[]): GeminiMessage[] {
  return messages.map((message) => ({
    role: toGeminiRole(message.role),
    parts: [
      {
        text: message.content,
      },
    ],
  }));
}

function toGeminiRole(role: string): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}
