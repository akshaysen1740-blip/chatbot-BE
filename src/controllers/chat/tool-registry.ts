import { Tool } from "../../tools/tools.interface";

export class ToolRegistry {

  private tools = new Map<
    string,
    Tool
  >();

  register(tool: Tool) {

    this.tools.set(
      tool.name,
      tool
    );

  }

  get(name: string) {

    return this.tools.get(name);

  }

  getAll() {

    return [...this.tools.values()];

  }

}

export const toolRegistry =
  new ToolRegistry();