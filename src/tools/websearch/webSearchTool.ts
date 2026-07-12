import { ChatApiMessage, ChatRequestBody } from "../../types/chat.types";
import { WebSearchInput } from "../../types/webSearchTypes";
import { Tool } from "../tools.interface";
import webSearchService from "./webSearchService";

export class WebSearchTool implements Tool {
  name = "web_search";

  description = "Searches the internet for current and real-time information.";

  async execute(body: ChatRequestBody): Promise<ChatApiMessage> {
    const messages = body.messages;

    if (!messages || messages.length === 0) {
      throw new Error("No message found");
    }
    return webSearchService.search(messages);
  }
}

export const webSearchTool = new WebSearchTool();
