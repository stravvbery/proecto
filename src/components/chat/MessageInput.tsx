"use client";

import { useState, useRef, useEffect } from "react";
import { Smile, SendHorizontal } from "lucide-react";

interface MessageInputProps {
  channelName: string;
  onSend: (content: string) => void;
}

export function MessageInput({ channelName, onSend }: MessageInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [content]);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 pb-6 pt-0">
      <div
        className="flex items-end gap-2 rounded-lg px-4 py-2"
        style={{ backgroundColor: "#383a40" }}
      >
        <button className="p-1 shrink-0" style={{ color: "#b5bac1" }}>
          <Smile size={22} />
        </button>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Напишите сообщение в #${channelName}`}
          className="flex-1 resize-none bg-transparent text-sm outline-none max-h-[200px]"
          style={{ color: "#dcddde" }}
          rows={1}
        />
        {content.trim() && (
          <button
            onClick={handleSubmit}
            className="p-1 shrink-0"
            style={{ color: "#5865F2" }}
          >
            <SendHorizontal size={22} />
          </button>
        )}
      </div>
    </div>
  );
}
