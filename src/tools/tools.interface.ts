import { ChatApiMessage, ChatRequestBody } from "../types/chat.types";

export interface Tool {
  name: string;
  description: string;

  execute(input: ChatRequestBody): Promise<ChatApiMessage>;
}
