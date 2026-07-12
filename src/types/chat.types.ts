export type IncomingMessage = {
  role: string;
  content?: string;
  message?: string;
};

export type ChatApiMessage = {
  role: "user" | "assistant";
  content: string;
};

export interface ApiResponse<T> {
  statusCode: number;
  status: "success" | "error";
  message: string;
  data: T;
}

export type GeminiMessage = {
  role: "user" | "model";
  parts: Array<{
    text: string;
  }>;
};

export type ChatRequestBody = {
  messages: IncomingMessage[];
};

export interface ExecutionPlan {
  requiresTool: boolean;

  toolName?: string;

  input?: ChatRequestBody;
}
