import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { verifyToken } from "@/lib/auth/session";
import { initOrchestrator, setUserOnline, onNewMessage } from "@/lib/llm/orchestrator";

const onlineUsers = new Map<string, Set<string>>();

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    path: "/socket.io",
  });

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

    // Track presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // If stravvbery comes online, start bot tick
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
      // Message is saved via API, but we trigger bot reactions here
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

  return io;
}

function getOnlineUserIds(): string[] {
  return Array.from(onlineUsers.keys());
}

export { onlineUsers };
