"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocketUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return `${window.location.protocol}//${host}:3001`;
    }
    // When behind a tunnel/proxy, Socket.IO runs on a separate subdomain
    // The socket URL is passed via a meta tag or env variable
    const socketMeta = document.querySelector('meta[name="socket-url"]');
    if (socketMeta) {
      return socketMeta.getAttribute("content") || "https://lpnzr-54-201-200-193.run.pinggy-free.link";
    }
    return "https://lpnzr-54-201-200-193.run.pinggy-free.link";
  }
  return "http://localhost:3001";
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(token: string) {
  const s = getSocket();
  s.auth = { token };
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
