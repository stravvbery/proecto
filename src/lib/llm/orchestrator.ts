import { db } from "@/lib/db/client";
import { messages, events, channels, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { chatCompletion, BOT_MODELS } from "./agent-router";
import { getPersona, getAllBotIds, PERSONAS } from "./personas";
import { getTopMemories, extractMemories } from "./memory";
import type { Server as SocketIOServer } from "socket.io";

const TICK_MIN = 10000;
const TICK_MAX = 30000;
const BOT_COOLDOWN = 30000;
const CHANNEL_COOLDOWN = 5000;
const MSG_REACT_CHANCE = 0.8;
const CHAIN_REACT_CHANCE = 0.3;
const MAX_CHAIN_DEPTH = 5;

const CHAT_CHANNEL_ID = "ch-chat";
const SERVER_ID = "srv-hondafx-legacy";

const botCooldowns = new Map<string, number>();
const channelCooldowns = new Map<string, number>();
let tickInterval: ReturnType<typeof setTimeout> | null = null;
let io: SocketIOServer | null = null;
let isUserOnline = false;

export function initOrchestrator(socketIO: SocketIOServer) {
  io = socketIO;
}

export function setUserOnline(online: boolean) {
  isUserOnline = online;
  if (online && !tickInterval) {
    scheduleTick();
  } else if (!online && tickInterval) {
    clearTimeout(tickInterval);
    tickInterval = null;
  }
}

function scheduleTick() {
  const delay = TICK_MIN + Math.random() * (TICK_MAX - TICK_MIN);
  tickInterval = setTimeout(async () => {
    if (isUserOnline) {
      await doTick();
      scheduleTick();
    }
  }, delay);
}

function canBotSpeak(botId: string): boolean {
  const last = botCooldowns.get(botId) || 0;
  return Date.now() - last >= BOT_COOLDOWN;
}

function canChannelReceive(channelId: string): boolean {
  const last = channelCooldowns.get(channelId) || 0;
  return Date.now() - last >= CHANNEL_COOLDOWN;
}

function markBotSpoke(botId: string) {
  botCooldowns.set(botId, Date.now());
}

function markChannelReceived(channelId: string) {
  channelCooldowns.set(channelId, Date.now());
}

function buildServerState(): string {
  const allChannels = db
    .select()
    .from(channels)
    .where(eq(channels.serverId, SERVER_ID))
    .all();
  const allUsers = db.select().from(users).all();

  return `Сервер: SCP:SL · hondafx legacy
Каналы: ${allChannels.map((c) => `#${c.name}`).join(", ")}
Участники: ${allUsers.map((u) => u.username).join(", ")}
stravvbery сейчас ${isUserOnline ? "онлайн" : "офлайн"}.`;
}

function getRecentMessages(channelId: string, limit: number = 30) {
  return db
    .select({
      id: messages.id,
      content: messages.content,
      userId: messages.userId,
      createdAt: messages.createdAt,
      username: users.username,
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.channelId, channelId))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .all()
    .reverse();
}

function getRecentEvents(limit: number = 15) {
  return db
    .select()
    .from(events)
    .where(eq(events.serverId, SERVER_ID))
    .orderBy(desc(events.createdAt))
    .limit(limit)
    .all()
    .reverse();
}

function getImportantChannelsContent(): string {
  const importantChannels = db
    .select()
    .from(channels)
    .where(and(eq(channels.serverId, SERVER_ID), eq(channels.isImportant, true)))
    .all();

  let content = "";
  for (const ch of importantChannels) {
    const msgs = db
      .select({ content: messages.content, username: users.username })
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.channelId, ch.id))
      .orderBy(desc(messages.createdAt))
      .limit(5)
      .all()
      .reverse();
    if (msgs.length > 0) {
      content += `\n--- #${ch.name} ---\n`;
      content += msgs
        .map((m) => `${m.username}: ${m.content.slice(0, 200)}`)
        .join("\n");
    }
  }
  return content;
}

async function buildBotContext(
  botId: string,
  channelId: string,
  triggerEvent?: string
): Promise<Array<{ role: "system" | "user" | "assistant"; content: string }>> {
  const persona = getPersona(botId);
  if (!persona) return [];

  const serverState = buildServerState();
  const recentMsgs = getRecentMessages(channelId);
  const recentEvents = getRecentEvents();
  const importantContent = getImportantChannelsContent();
  const memories = getTopMemories(botId);

  const systemPrompt = `${persona.systemPrompt}

--- ТЕКУЩЕЕ СОСТОЯНИЕ СЕРВЕРА ---
${serverState}

--- ПОСЛЕДНИЕ СОБЫТИЯ ---
${recentEvents.map((e) => `[${e.createdAt}] ${e.type}: ${e.data}`).join("\n") || "Нет событий"}

--- ВАЖНЫЕ КАНАЛЫ ---
${importantContent || "Пусто"}

--- ТВОИ ВОСПОМИНАНИЯ ---
${memories.map((m) => `• ${m.content} (важность: ${m.importance})`).join("\n") || "Пока ничего не запомнил"}

${triggerEvent ? `--- ТРИГГЕР ---\n${triggerEvent}` : ""}`;

  const chatMessages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [{ role: "system", content: systemPrompt }];

  for (const msg of recentMsgs) {
    const isThisBot = msg.userId === botId;
    chatMessages.push({
      role: isThisBot ? "assistant" : "user",
      content: `[${msg.username}]: ${msg.content}`,
    });
  }

  return chatMessages;
}

async function botSendMessage(
  botId: string,
  channelId: string,
  triggerEvent?: string
): Promise<string | null> {
  const persona = getPersona(botId);
  if (!persona) return null;

  const model = BOT_MODELS[botId] || persona.model;
  const context = await buildBotContext(botId, channelId, triggerEvent);
  if (context.length === 0) return null;

  // Emit typing
  io?.to(channelId).emit("typing:start", {
    userId: botId,
    username: persona.username,
    channelId,
  });

  // Simulate typing delay (2-6 seconds)
  const typingDelay = 2000 + Math.random() * 4000;
  await new Promise((resolve) => setTimeout(resolve, typingDelay));

  const response = await chatCompletion(model, context);
  
  io?.to(channelId).emit("typing:stop", {
    userId: botId,
    channelId,
  });

  if (!response) return null;

  // Clean the response - remove "[username]:" prefix if the model added it
  let cleanResponse = response;
  const prefixPattern = new RegExp(`^\\[?${persona.username}\\]?:\\s*`, "i");
  cleanResponse = cleanResponse.replace(prefixPattern, "");

  // Save message to DB
  const msgId = uuid();
  const now = new Date().toISOString();
  db.insert(messages)
    .values({
      id: msgId,
      channelId,
      userId: botId,
      content: cleanResponse,
      createdAt: now,
    })
    .run();

  const msgData = {
    id: msgId,
    channelId,
    userId: botId,
    content: cleanResponse,
    createdAt: now,
    user: {
      id: botId,
      username: persona.username,
      avatarUrl: `/avatars/${persona.username}.svg`,
      isBot: true,
    },
  };

  // Broadcast
  io?.to(channelId).emit("message:new", msgData);

  markBotSpoke(botId);
  markChannelReceived(channelId);

  // Extract memories in background
  const contextSummary = `Канал: #${channelId}, бот ${persona.username} ответил`;
  extractMemories(botId, cleanResponse, contextSummary).catch(() => {});

  return cleanResponse;
}

async function doTick() {
  if (!canChannelReceive(CHAT_CHANNEL_ID)) return;

  const availableBots = getAllBotIds().filter((id) => canBotSpeak(id));
  if (availableBots.length === 0) return;

  const botId = availableBots[Math.floor(Math.random() * availableBots.length)];
  await botSendMessage(botId, CHAT_CHANNEL_ID);
}

export async function onNewMessage(
  channelId: string,
  userId: string,
  _messageContent: string,
  depth: number = 0
) {
  if (depth >= MAX_CHAIN_DEPTH) return;
  if (!canChannelReceive(channelId)) return;

  const isBot = userId.startsWith("user-") && userId !== "user-stravvbery";
  const chance = isBot ? CHAIN_REACT_CHANCE : MSG_REACT_CHANCE;

  if (Math.random() > chance) return;

  // Delay before responding (2-8 seconds)
  const delay = 2000 + Math.random() * 6000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Pick 1-3 bots to respond (excluding the sender)
  const respondCount = 1 + Math.floor(Math.random() * 2);
  const availableBots = getAllBotIds().filter(
    (id) => id !== userId && canBotSpeak(id)
  );

  const respondingBots = availableBots
    .sort(() => Math.random() - 0.5)
    .slice(0, respondCount);

  for (const botId of respondingBots) {
    const response = await botSendMessage(botId, channelId);
    if (response && depth < MAX_CHAIN_DEPTH - 1) {
      // Chain reaction with lower probability
      setTimeout(() => {
        onNewMessage(channelId, botId, response, depth + 1);
      }, 3000 + Math.random() * 5000);
    }
  }
}

const EVENT_REACT_CHANCES: Record<string, number> = {
  "announcement.posted": 0.9,
  "role.assigned": 0.8,
  "member.muted": 0.7,
  "member.banned": 0.7,
  "channel.created": 0.5,
  "channel.renamed": 0.3,
  "channel.deleted": 0.3,
  "message.deleted": 0.1,
};

export async function onNewEvent(
  eventType: string,
  eventData: Record<string, unknown>,
  actorId: string | null
) {
  const chance = EVENT_REACT_CHANCES[eventType] || 0.2;
  if (Math.random() > chance) return;

  const delay = 5000 + Math.random() * 25000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const reactCount = 1 + Math.floor(Math.random() * 2);
  const availableBots = getAllBotIds().filter(
    (id) => id !== actorId && canBotSpeak(id)
  );
  const reactingBots = availableBots
    .sort(() => Math.random() - 0.5)
    .slice(0, reactCount);

  const actorName = actorId
    ? PERSONAS[actorId]?.username || actorId
    : "unknown";
  const triggerDescription = `Событие: ${eventType} — ${JSON.stringify(eventData)} (сделал: ${actorName})`;

  for (const botId of reactingBots) {
    await botSendMessage(botId, CHAT_CHANNEL_ID, triggerDescription);
  }
}
