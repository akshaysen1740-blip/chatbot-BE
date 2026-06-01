import "dotenv/config";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  openRouterApiUrl: getRequiredEnv("OPENROUTER_API_URL"),
  openRouterApiKey: getRequiredEnv("OPENROUTER_API_KEY"),
};
