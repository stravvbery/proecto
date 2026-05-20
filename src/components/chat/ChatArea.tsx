"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useApp } from "@/app/app/layout";
import { ChannelHeader } from "./ChannelHeader";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { DayDivider } from "./DayDivider";
import type { Message } from "@/types";

interface ChatAreaProps {
  channelId: string;
  serverId: string;
}

export function ChatArea({ channelId }: ChatAreaProps) {
  const { socket, joinChannel, leaveChannel, notifyMessage, channels } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<
    Array<{ userId: string; username: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const currentChannel = channels
    .flatMap((g) => g.channels)
    .find((ch) => ch.id === channelId);

  const scrollToBottom = useCallback(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const threshold = 100;
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  const prevChannelRef = useRef(channelId);
  if (prevChannelRef.current !== channelId) {
    prevChannelRef.current = channelId;
    setMessages([]);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    const loadMessages = async () => {
      const res = await fetch(`/api/channels/${channelId}/messages?limit=50`);
      const data = await res.json();
      if (!cancelled) {
        setMessages(data);
        setLoading(false);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView();
        }, 100);
      }
    };
    loadMessages();
    return () => { cancelled = true; };
  }, [channelId]);

  useEffect(() => {
    joinChannel(channelId);

    const handleNewMessage = (msg: Message) => {
      if (msg.channelId === channelId) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(scrollToBottom, 50);
      }
    };

    const handleTypingStart = (data: {
      userId: string;
      username: string;
      channelId: string;
    }) => {
      if (data.channelId === channelId) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === data.userId)) return prev;
          return [...prev, { userId: data.userId, username: data.username }];
        });
      }
    };

    const handleTypingStop = (data: { userId: string; channelId: string }) => {
      if (data.channelId === channelId) {
        setTypingUsers((prev) =>
          prev.filter((u) => u.userId !== data.userId)
        );
      }
    };

    const handleMessageEdit = (data: { id: string; content: string; editedAt: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.id ? { ...m, content: data.content, editedAt: data.editedAt } : m
        )
      );
    };

    const handleMessageDelete = (data: { id: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.id));
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("message:edit", handleMessageEdit);
    socket.on("message:delete", handleMessageDelete);

    return () => {
      leaveChannel(channelId);
      socket.off("message:new", handleNewMessage);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("message:edit", handleMessageEdit);
      socket.off("message:delete", handleMessageDelete);
    };
  }, [channelId, socket, joinChannel, leaveChannel, scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    const res = await fetch(`/api/channels/${channelId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      notifyMessage(channelId, content);
      setTimeout(scrollToBottom, 50);
    }
  };

  const shouldShowDivider = (msg: Message, prevMsg: Message | undefined) => {
    if (!prevMsg) return true;
    const d1 = new Date(msg.createdAt).toDateString();
    const d2 = new Date(prevMsg.createdAt).toDateString();
    return d1 !== d2;
  };

  const shouldGroupWithPrevious = (msg: Message, prevMsg: Message | undefined) => {
    if (!prevMsg) return false;
    if (msg.userId !== prevMsg.userId) return false;
    const diff =
      new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime();
    return diff < 5 * 60 * 1000;
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">
      <ChannelHeader
        channelName={currentChannel?.name || ""}
        channelTopic={currentChannel?.topic || ""}
      />

      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#1a1b1e #2b2d31",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span style={{ color: "#b5bac1" }}>Загрузка сообщений...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="text-4xl">💬</div>
            <div className="text-lg font-semibold" style={{ color: "#f2f3f5" }}>
              Добро пожаловать в #{currentChannel?.name}!
            </div>
            <div className="text-sm" style={{ color: "#b5bac1" }}>
              В этом канале пока нет сообщений. Начните общение!
            </div>
          </div>
        ) : (
          <div className="pb-6">
            {messages.map((msg, i) => {
              const prevMsg = messages[i - 1];
              const showDivider = shouldShowDivider(msg, prevMsg);
              const grouped = shouldGroupWithPrevious(msg, prevMsg);
              return (
                <div key={msg.id}>
                  {showDivider && <DayDivider date={msg.createdAt} />}
                  <MessageItem
                    message={msg}
                    grouped={grouped}
                    channelId={channelId}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <TypingIndicator typingUsers={typingUsers} />
      <MessageInput
        channelName={currentChannel?.name || ""}
        onSend={handleSendMessage}
      />
    </div>
  );
}
