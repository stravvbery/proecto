import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.AGENT_ROUTER_API_KEY || "sk-placeholder",
      baseURL: process.env.AGENT_ROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    });
  }
  return client;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletion(
  model: string,
  messages: ChatMessage[],
  maxTokens: number = 300
): Promise<string> {
  try {
    const response = await getClient().chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.9,
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error(`[LLM] Error calling ${model}:`, error);
    return "";
  }
}

export const BOT_MODELS: Record<string, string> = {
  "user-hixxivxq": "glm-4-plus",
  "user-honda": "deepseek/deepseek-chat-v3-0324",
  "user-ksynaxxxxx": "google/gemini-2.5-flash-preview",
  "user-rrqxet": "glm-4-plus",
  "user-saishiku": "anthropic/claude-3.5-haiku",
  "user-vntrpz": "deepseek/deepseek-chat",
};
