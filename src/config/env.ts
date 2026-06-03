import "dotenv/config";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getEnv(name: string): string | undefined {
  return process.env[name];
}

export const env = {
  geminiApiKey:
    getEnv("GEMINI_API_KEY") ??
    getEnv("GOOGLE_API_KEY") ??
    getRequiredEnv("OPENROUTER_API_KEY"),
  geminiModel: getEnv("GEMINI_MODEL") ?? "gemini-2.5-flash",
};
