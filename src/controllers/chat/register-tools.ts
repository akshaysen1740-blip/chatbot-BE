import { ragTool } from "../../tools/rag.tool";
import { toolRegistry } from "./tool-registry";

export function registerTools() {
    toolRegistry.register(ragTool);
}