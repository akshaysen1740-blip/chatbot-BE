import { env } from "../config/env";
import aiClient from "../config/gemini.client";
import { executor } from "../controllers/chat/executor";
import { planner } from "../controllers/chat/planner";
import { ChatRequestBody } from "../types/chat.types";

class ChatService {
  async chat(body: ChatRequestBody) {
    /**
     * Step 1
     * Build a plan.
     */

    const plan = await planner.plan(body);

    /**
     * Step 2
     * Does the planner
     * need a tool?
     */

    if (plan.requiresTool) {
      return executor.execute(plan);
    } else {
      return await genralPurposeResponse(body);
    }
  }
}

async function genralPurposeResponse(body: any) {
  const response = await aiClient.models.generateContent({
    model: env.geminiModel,
    contents: body.messages.at(-1).message,
    config: {
      systemInstruction: "You are a helpful assistant.",
      temperature: 0.2,
      maxOutputTokens: 200,
      responseMimeType: "application/json",
    },
  });
  console.log("response", response);
  return {
    role: "assistant",
    content: response.text,
  };
}

export const chatService = new ChatService();
