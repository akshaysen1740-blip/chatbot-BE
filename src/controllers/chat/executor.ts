import { ChatApiMessage, ExecutionPlan } from "../../types/chat.types";
import { toolRegistry } from "./tool-registry";

export class Executor {
  async execute(plan: ExecutionPlan): Promise<ChatApiMessage> {
    if (!plan.toolName) {
      throw new Error("No tool selected.");
    }

    if (!plan.input) {
      throw new Error("No tool input provided.");
    }

    const tool = toolRegistry.get(plan.toolName);

    if (!tool) {
      throw new Error(`Tool ${plan.toolName} not found`);
    }

    return tool.execute(plan.input);
  }
}

export const executor = new Executor();
