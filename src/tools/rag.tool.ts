import { env } from "../config/env";
import {
  ChatApiMessage,
  ChatRequestBody,
  GeminiMessage,
  IncomingMessage,
} from "../types/chat.types";
import aiClient from "../config/gemini.client";
import { vectorService } from "../services/vector.service";
import { Tool } from "./tools.interface";
import { buildRagPrompt, getSummarPrompt } from "../prompts/system.prompts";


class RagTool implements Tool {
  name: string = "Rag";
  description: string = "For Rag services";

  async execute(body: ChatRequestBody): Promise<ChatApiMessage> {
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
        systemInstruction: buildRagPrompt(context),
        temperature: 0.9,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return {
      role: "assistant",
      content: text,
    };
  }

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



  private async summarizeMessages(
    messages: ChatApiMessage[],
  ): Promise<ChatApiMessage> {
    const messagesForSummary = messages.slice(0, -10);

    const response = await aiClient.models.generateContent({
      model: env.geminiModel,
      contents: this.toGeminiMessages(messagesForSummary),
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
}

export const ragTool = new RagTool();
