import { normalizeIncomingMessage, summarizeMessages, toGeminiMessages } from "../../common/commonUtills";
import { env } from "../../config/env";
import aiClient from "../../config/gemini.client";
import { webSearchPrompt } from "../../prompts/system.prompts";
import { ChatApiMessage, IncomingMessage } from "../../types/chat.types";

class WebSearchService {
  async search(messages: IncomingMessage[]): Promise<ChatApiMessage> {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("messages must be a non-empty array");
    }

    const normalizedMessages = messages.map((message) =>
      normalizeIncomingMessage(message),
    );

    const filteredMessages = normalizedMessages.filter(
      (message): message is ChatApiMessage => message !== null,
    );

    if (filteredMessages.length === 0) {
      throw new Error("No valid messages provided");
    }

    const conversationMessages =
      filteredMessages.length > 20
        ? [await summarizeMessages(filteredMessages), ...filteredMessages.slice(-10)]
        : filteredMessages;

    const currentMessage = conversationMessages.at(-1);

    if (!currentMessage) {
      throw new Error("No current message found");
    }

    const currentQuestion = currentMessage.content;
    // Gemini API call
    const response = await aiClient.models.generateContent({
      model: env.geminiModel,
      contents: toGeminiMessages(conversationMessages),
      config: {
        systemInstruction: webSearchPrompt(),
        temperature: 0.7,
        maxOutputTokens: 1024,
        tools: [
          {
            googleSearch: {},
          },
        ],
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

export default new WebSearchService();
