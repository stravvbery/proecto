"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { connectSocket, getSocket } from "@/lib/socket/client";
import type { Socket } from "socket.io-client";

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket>(getSocket());
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!token) return;

    const s = connectSocket(token);
    socketRef.current = s;
    forceRender((n) => n + 1);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onPresence = (data: { onlineUsers: string[] }) => {
      setOnlineUsers(data.onlineUsers);
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("presence:update", onPresence);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("presence:update", onPresence);
    };
  }, [token]);

  const joinChannel = useCallback((channelId: string) => {
    socketRef.current.emit("join:channel", channelId);
  }, []);

  const leaveChannel = useCallback((channelId: string) => {
    socketRef.current.emit("leave:channel", channelId);
  }, []);

  const notifyMessage = useCallback(
    (channelId: string, content: string) => {
      socketRef.current.emit("message:send", { channelId, content });
    },
    []
  );

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinChannel,
    leaveChannel,
    notifyMessage,
  };
}
