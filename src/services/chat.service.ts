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
    }

    throw new Error("No execution path.");
  }
}

export const chatService = new ChatService();
