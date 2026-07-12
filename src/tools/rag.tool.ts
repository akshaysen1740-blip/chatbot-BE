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
import {
  normalizeIncomingMessage,
  summarizeMessages,
  toGeminiMessages,
} from "../common/commonUtills";

class RagTool implements Tool {
  name: string = "Rag";
  description =
    "Retrieves information from the company's private knowledge base. Use for questions about internal documents, policies, procedures, products, and company-specific information.";
  async execute(body: ChatRequestBody): Promise<ChatApiMessage> {
    const rawMessages = body?.messages;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      throw new Error("messages must be a non-empty array");
    }

    const normalizedMessages = rawMessages.map((message) =>
      normalizeIncomingMessage(message),
    );

    const messages = normalizedMessages.filter(
      (message): message is ChatApiMessage => message !== null,
    );

    if (messages.length === 0) {
      throw new Error("No valid messages provided");
    }

    const conversationMessages =
      messages.length > 20
        ? [await summarizeMessages(messages), ...messages.slice(-10)]
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
      contents: toGeminiMessages(conversationMessages),
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
}

export const ragTool = new RagTool();
