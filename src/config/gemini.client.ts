import { GoogleGenAI } from "@google/genai";
import { env } from "process";

const aiClient = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});

export default aiClient;