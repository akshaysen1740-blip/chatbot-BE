import axios from "axios";
import { Request, Response } from "express";
import { env } from "../config/env";

type IncomingMessage = {
  role: string;
  content?: string;
  message?: string;
};

type ChatApiMessage = {
  role: string;
  content: string;
};

type ChatRequestBody = {
  messages?: IncomingMessage[];
};

function normalizeIncomingMessage(
  message: IncomingMessage,
): ChatApiMessage | null {
  const content = message.content ?? message.message;

  if (!message.role || !content) {
    return null;
  }

  return {
    role: message.role,
    content,
  };
}

function getRecentMessages(messages: ChatApiMessage[]): ChatApiMessage[] {
  return messages.slice(-10);
}

const systemPrompts = [
  `ts
    const systemPrompt = {
      role: "system",
      content: 
    You are a JSON generator.

    Return ONLY valid JSON.

    Do not wrap in markdown.
    Do not explain.
    Do not add any extra text.

    Format:
    {
      "role": "user",
      "content": "Summary of earlier conversation"
    }
    `
];

async function summarizeMessages(
  messages: ChatApiMessage[],
): Promise<ChatApiMessage> {
  const messagesForSummary = messages.slice(20);
  console.log(messagesForSummary, "summary");
  const systemPrompt = {
    role: "system",
    content: systemPrompts[0],
  };
  const conversationSummary = await axios.post(
    env.openRouterApiUrl,
    {
      model: "google/gemma-4-26b-a4b-it:free",
      messages: [systemPrompt, ...messagesForSummary],
    },
    {
      headers: {
        Authorization: `Bearer ${env.geminiApiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  console.log(conversationSummary.data.choices[0].message.content, "summary");
  const summary = JSON.parse(
    conversationSummary.data.choices[0].message.content,
  );

  return {
    role: "user",
    content: summary,
  };
}

export const chatController = async (
  req: Request<unknown, unknown, ChatRequestBody>,
  res: Response,
): Promise<Response | void> => {
  const rawMessages = req.body?.messages;

  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return res.status(400).json({
      error: "messages must be a non-empty array",
    });
  }
  try {
    const normalizedMessages = rawMessages.map(normalizeIncomingMessage);

    if (normalizedMessages.some((message) => message === null)) {
      return res.status(400).json({
        error: "Each message must include role and content or message",
      });
    }

    let messages = normalizedMessages.filter(
      (message): message is ChatApiMessage => message !== null,
    );

    // messageSummarization
    const systemPrompt = {
      role: "system",
      content: `
        You are a helpful assistant.
        `,
    };

    const conversationMessages =
      messages.length > 20
        ? [
            systemPrompt,
            await summarizeMessages(messages),
            ...messages.slice(20),
          ]
        : [systemPrompt, ...messages];

    const response = await axios.post(
      env.openRouterApiUrl,
      {
        model: "google/gemma-4-26b-a4b-it:free",
        temperature: 1.0,
        max_tokens: 200,
        messages: conversationMessages,
      },
      {
        headers: {
          Authorization: `Bearer ${env.geminiApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );
    // const formatedRes = JSON.parse(response.data.choices[0].message.content);
    // console.log(formatedRes)
    res.json(response.data.choices[0]);
  } catch (error: any) {
    const details = error.response?.data || error.message;
    console.log(details);

    res.status(error.response?.status || 500).json({
      error: "Something went wrong",
      details,
    });
  }
};
