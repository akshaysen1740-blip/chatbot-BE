import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import { vectorService } from "./vector.service";
import {
  ChatApiMessage,
  ChatRequestBody,
  GeminiMessage,
  IncomingMessage,
} from "../types/chat.types";
import aiClient from "../config/gemini.client";



const SUMMARY_SYSTEM_INSTRUCTION = `You summarize earlier conversation turns for continued context.
Return only valid JSON with this exact shape:
{
  "role": "user",
  "content": "Concise summary of the earlier conversation"
}
Do not wrap the JSON in markdown and do not add extra text.`;

class ChatService {
  private normalizeIncomingMessage(
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

  private toGeminiRole(role: string): "user" | "model" {
    return role === "assistant" ? "model" : "user";
  }

  private toGeminiMessages(messages: ChatApiMessage[]): GeminiMessage[] {
    return messages.map((message) => ({
      role: this.toGeminiRole(message.role),
      parts: [
        {
          text: message.content,
        },
      ],
    }));
  }

  private buildRagPrompt(context: string): string {
    return `
    You are a helpful assistant.

    Answer ONLY from the provided context.

    If the answer is not present in the context,
    say "I could not find that information."

    Context:
    ${context}
    `;
  }

  private async summarizeMessages(
    messages: ChatApiMessage[],
  ): Promise<ChatApiMessage> {
    const messagesForSummary = messages.slice(0, -10);

    const response = await aiClient.models.generateContent({
      model: env.geminiModel,
      contents: this.toGeminiMessages(messagesForSummary),
      config: {
        systemInstruction: SUMMARY_SYSTEM_INSTRUCTION,
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
      content: summaryText,
    };
  }

  async chat(body: ChatRequestBody) {
    const rawMessages = body?.messages;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      throw new Error("messages must be a non-empty array");
    }

    const normalizedMessages = rawMessages.map((message) =>
      this.normalizeIncomingMessage(message),
    );

    const messages = normalizedMessages.filter(
      (message): message is ChatApiMessage => message !== null,
    );

    if (messages.length === 0) {
      throw new Error("No valid messages provided");
    }

    const conversationMessages =
      messages.length > 20
        ? [await this.summarizeMessages(messages), ...messages.slice(-10)]
        : messages;

    const currentMessage = conversationMessages.at(-1);

    if (!currentMessage) {
      throw new Error("No current message found");
    }

    const currentQuestion = currentMessage.content;

    const chunks = await vectorService.search(currentQuestion, 5);

    const context = chunks.map((chunk) => chunk.content).join("\n\n");

    const response = await aiClient.models.generateContent({
      model: env.geminiModel,
      contents: this.toGeminiMessages(conversationMessages),
      config: {
        systemInstruction: this.buildRagPrompt(context),
        temperature: 0.9,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return {
      message: {
        role: "assistant",
        content: text,
      },
      sources: chunks.map((chunk) => ({
        id: chunk.id,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
      })),
    };
  }
}

export const chatService = new ChatService();
