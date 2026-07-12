import { ragTool } from "../../tools/rag.tool";
import { webSearchTool } from "../../tools/websearch/webSearchTool";
import { toolRegistry } from "./tool-registry";

export function registerTools() {
  toolRegistry.register(ragTool);
  toolRegistry.register(webSearchTool);
}
