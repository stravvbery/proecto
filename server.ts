import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env.local before anything else
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const port = parseInt(process.env.SOCKET_PORT || "3001", 10);

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Dynamically import orchestrator modules (they use path aliases resolved at runtime)
async function startSocketServer() {
  const { verifyToken } = await import("./src/lib/auth/jwt");
  const { initOrchestrator, setUserOnline, onNewMessage } = await import("./src/lib/llm/orchestrator");

  const onlineUsers = new Map<string, Set<string>>();

  function getOnlineUserIds(): string[] {
    return Array.from(onlineUsers.keys());
  }

  initOrchestrator(io);

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    const session = await verifyToken(token);
    if (!session) {
      return next(new Error("Invalid token"));
    }
    socket.data.userId = session.userId;
    socket.data.username = session.username;
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    const username = socket.data.username as string;
    console.log(`[Socket] ${username} connected`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    if (userId === "user-stravvbery") {
      setUserOnline(true);
    }

    io.emit("presence:update", {
      userId,
      username,
      online: true,
      onlineUsers: getOnlineUserIds(),
    });

    socket.on("join:channel", (channelId: string) => {
      socket.join(channelId);
    });

    socket.on("leave:channel", (channelId: string) => {
      socket.leave(channelId);
    });

    socket.on("message:send", async (data: { channelId: string; content: string }) => {
      onNewMessage(data.channelId, userId, data.content);
    });

    socket.on("disconnect", () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          if (userId === "user-stravvbery") {
            setUserOnline(false);
          }
          io.emit("presence:update", {
            userId,
            username,
            online: false,
            onlineUsers: getOnlineUserIds(),
          });
        }
      }
      console.log(`[Socket] ${username} disconnected`);
    });
  });

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`> Socket.IO server on http://0.0.0.0:${port}`);
  });
}

startSocketServer().catch(console.error);
