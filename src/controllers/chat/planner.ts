import { ChatRequestBody, ExecutionPlan } from "../../types/chat.types";

export class Planner {
  async plan(body: ChatRequestBody): Promise<ExecutionPlan> {
    const currentMessage = body.messages.at(-1);

    if (!currentMessage) {
      throw new Error("No message found");
    }

    const question = currentMessage.message ? currentMessage.message.toLowerCase() : "";

    /**
     * Temporary Planner
     *
     * Later Gemini will do this.
     */
    if(!question){
        throw new Error("No question found");
    }

    if (question.includes("document")) {
      return {
        requiresTool: true,

        toolName: "rag",

        input: body,
      };
    }

    return {
      requiresTool: true,

      toolName: "rag",

      input: body,
    };
  }
}

export const planner = new Planner();
