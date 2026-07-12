import { env } from "../../config/env";
import aiClient from "../../config/gemini.client";
import { getPlannersPromt } from "../../prompts/system.prompts";
import { ChatRequestBody, ExecutionPlan } from "../../types/chat.types";
import { toolRegistry } from "./tool-registry";

export class Planner {
  async plan(body: ChatRequestBody): Promise<ExecutionPlan> {
    const currentMessage = body.messages.at(-1);

    if (!currentMessage) {
      throw new Error("No message found");
    }

    const question = currentMessage.message?.trim();

    if (!question) {
      throw new Error("No question found");
    }

    // Dynamically build tool list
    const availableTools = toolRegistry
      .getAll()
      .map(
        (tool) => `Tool Name: ${tool.name}
        Description: ${tool.description}`,
      )
      .join("\n\n");

    const plannerPrompt = getPlannersPromt(availableTools);

    const response = await aiClient.models.generateContent({
      model: env.geminiModel,
      contents: question,
      config: {
        systemInstruction: plannerPrompt,
        temperature: 0,

        responseMimeType: "application/json",

        responseSchema: {
          type: "object",
          properties: {
            requiresTool: {
              type: "boolean",
            },
            toolName: {
              type: "string",
            },
          },
          required: [" "],
        },
      },
    });

    if (!response.text) {
      throw new Error("Planner returned an empty response");
    }

    const plan = JSON.parse(response.text);
    return {
      requiresTool: plan.requiresTool,
      toolName: plan.toolName,
      input: body,
    };
  }
}

export const planner = new Planner();
