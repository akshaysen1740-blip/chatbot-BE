import { ExecutionPlan } from "../../types/chat.types";
import { toolRegistry } from "./tool-registry";

export class Executor {
  async execute(plan: ExecutionPlan) {
    if (!plan.toolName) {
      throw new Error("No tool selected.");
    }

    const tool = toolRegistry.get(plan.toolName);

    if (!tool) {
      throw new Error(`Tool ${plan.toolName} not found`);
    }

    return tool.execute(plan.input);
  }
}

export const executor = new Executor();
