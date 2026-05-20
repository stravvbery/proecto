import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const baseURL = process.env.AGENT_ROUTER_BASE_URL || "https://agentrouter.org/v1";
    const apiKey = process.env.AGENT_ROUTER_API_KEY || "sk-placeholder";
    console.log(`[LLM] Initializing client: baseURL=${baseURL}`);
    client = new OpenAI({ apiKey, baseURL });
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
    const content = response.choices[0]?.message?.content?.trim() || "";
    if (content) {
      console.log(`[LLM] ${model} responded (${content.length} chars)`);
    } else {
      console.warn(`[LLM] ${model} returned empty response`);
    }
    return content;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[LLM] Error calling ${model}: ${errMsg}`);
    return "";
  }
}

export const BOT_MODELS: Record<string, string> = {
  "user-hixxivxq": "glm-4.5",
  "user-honda": "deepseek-v3.1",
  "user-ksynaxxxxx": "gpt-5",
  "user-rrqxet": "glm-4.6",
  "user-saishiku": "glm-4.5",
  "user-vntrpz": "deepseek-v3.1",
};
