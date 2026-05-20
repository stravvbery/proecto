"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentUrl: string | null = null;
let resolvedSocketUrl: string | null = null;

async function fetchSocketUrl(): Promise<string> {
  if (resolvedSocketUrl) return resolvedSocketUrl;
  try {
    const res = await fetch("/api/config");
    const data = await res.json();
    if (data.socketUrl) {
      resolvedSocketUrl = data.socketUrl;
      return data.socketUrl;
    }
  } catch {
    // fallback
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    resolvedSocketUrl = (host === "localhost" || host === "127.0.0.1")
      ? `${window.location.protocol}//${host}:3001`
      : `${window.location.protocol}//${host}:3001`;
  } else {
    resolvedSocketUrl = "http://localhost:3001";
  }
  return resolvedSocketUrl;
}

function getSocketUrlSync(): string {
  if (resolvedSocketUrl) return resolvedSocketUrl;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return (host === "localhost" || host === "127.0.0.1")
      ? `${window.location.protocol}//${host}:3001`
      : `${window.location.protocol}//${host}:3001`;
  }
  return "http://localhost:3001";
}

export function getSocket(): Socket {
  if (!socket) {
    const url = getSocketUrlSync();
    currentUrl = url;
    socket = io(url, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export async function connectSocket(token: string): Promise<Socket> {
  const url = await fetchSocketUrl();
  if (!socket || currentUrl !== url) {
    if (socket) socket.disconnect();
    currentUrl = url;
    socket = io(url, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
