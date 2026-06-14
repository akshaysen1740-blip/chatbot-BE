export type IncomingMessage = {
  role: string;
  content?: string;
  message?: string;
};

export type ChatApiMessage = {
  role: "user" | "assistant";
  content: string;
};

export type GeminiMessage = {
  role: "user" | "model";
  parts: Array<{
    text: string;
  }>;
};

export type ChatRequestBody = {
  messages?: IncomingMessage[];
};
