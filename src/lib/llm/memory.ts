import { db } from "@/lib/db/client";
import { botMemories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { chatCompletion } from "./agent-router";

export function getTopMemories(botId: string, limit: number = 5) {
  return db
    .select()
    .from(botMemories)
    .where(eq(botMemories.botId, botId))
    .orderBy(desc(botMemories.importance))
    .limit(limit)
    .all();
}

export function saveMemory(botId: string, content: string, importance: number) {
  db.insert(botMemories)
    .values({
      id: uuid(),
      botId,
      content,
      importance,
      createdAt: new Date().toISOString(),
    })
    .run();
}

export async function extractMemories(
  botId: string,
  messageContent: string,
  context: string
): Promise<void> {
  try {
    const response = await chatCompletion(
      "google/gemini-2.5-flash-preview",
      [
        {
          role: "system",
          content: `Ты — экстрактор памяти. Из сообщения и контекста извлеки 0-2 ключевых факта, которые стоит запомнить.
Формат ответа — ТОЛЬКО JSON массив (или пустой массив []):
[{"content": "факт", "importance": 5}]
importance от 1 до 10. Не извлекай банальности. Только важные факты: решения, события, новые правила, конфликты, смена ролей.
Если ничего важного — верни []`,
        },
        {
          role: "user",
          content: `Контекст:\n${context}\n\nСообщение:\n${messageContent}`,
        },
      ],
      200
    );

    if (!response) return;
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const memories: Array<{ content: string; importance: number }> = JSON.parse(cleaned);
    for (const mem of memories) {
      if (mem.content && mem.importance) {
        saveMemory(botId, mem.content, mem.importance);
      }
    }
  } catch {
    // Memory extraction is best-effort
  }
}
