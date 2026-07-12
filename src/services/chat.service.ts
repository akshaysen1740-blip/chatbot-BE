import { env } from "../config/env";
import aiClient from "../config/gemini.client";
import { executor } from "../controllers/chat/executor";
import { planner } from "../controllers/chat/planner";
import { ChatApiMessage, ChatRequestBody } from "../types/chat.types";

class ChatService {
  async chat(body: ChatRequestBody): Promise<ChatApiMessage> {
    /**
     * Step 1
     * Build a plan.
     */

    const plan = await planner.plan(body);
    console.log(plan, "15")
    if (plan.requiresTool) {
      return executor.execute(plan);
    } else {
      return await genralPurposeResponse(body);
    }
  }
}

async function genralPurposeResponse(body: ChatRequestBody): Promise<ChatApiMessage> {
  const currentMessage = body.messages.at(-1);
  const prompt = currentMessage?.content?.trim() || currentMessage?.message?.trim();

  if (!prompt) {
    throw new Error("No message found");
  }

  const response = await aiClient.models.generateContent({
    model: env.geminiModel,
    contents: prompt,
    config: {
      systemInstruction: "You are a helpful assistant.",
      temperature: 0.2,
      maxOutputTokens: 200,
      responseMimeType: "text/plain",
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response");
  }

  console.log(response.text, "<<<<<<");

  return {
    role: "assistant",
    content: response.text,
  };
}

export const chatService = new ChatService();
