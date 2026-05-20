"use client";

import { useState } from "react";
import { useApp } from "@/app/app/layout";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { formatTimestamp } from "@/lib/utils";
import { Trash2, Pencil } from "lucide-react";
import type { Message } from "@/types";

interface MessageItemProps {
  message: Message;
  grouped: boolean;
  channelId: string;
}

export function MessageItem({ message, grouped, channelId }: MessageItemProps) {
  const { user } = useApp();
  const [hovering, setHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isFounder = user?.roles.some((r) => r.name === "Founder");
  const isMod = user?.roles.some((r) =>
    ["Founder", "Admin", "Senior Mod", "Mod"].includes(r.name)
  );

  const roleColor = message.roleColor || "#b5bac1";
  const username = message.user?.username || "Unknown";
  const avatarLetter = username[0]?.toUpperCase() || "?";

  const handleDelete = async () => {
    await fetch(`/api/channels/${channelId}/messages/${message.id}`, {
      method: "DELETE",
    });
  };

  const handleEdit = async () => {
    await fetch(`/api/channels/${channelId}/messages/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    setEditing(false);
  };

  if (grouped) {
    return (
      <div
        className="relative px-4 py-0.5 group"
        style={{ backgroundColor: hovering ? "#2e3035" : "transparent" }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="pl-12">
          {/* Timestamp on hover */}
          <span
            className="absolute left-4 top-1 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity w-10 text-right"
            style={{ color: "#949ba4" }}
          >
            {new Date(message.createdAt).toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {editing ? (
            <EditBox
              value={editContent}
              onChange={setEditContent}
              onSave={handleEdit}
              onCancel={() => {
                setEditing(false);
                setEditContent(message.content);
              }}
            />
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
          {message.editedAt && !editing && (
            <span className="text-[10px] ml-1" style={{ color: "#949ba4" }}>
              (ред.)
            </span>
          )}
        </div>

        {hovering && !editing && (isFounder || isMod) && (
          <ActionButtons
            canEdit={!!isFounder}
            onEdit={() => setEditing(true)}
            onDelete={handleDelete}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="relative flex gap-4 px-4 pt-1 pb-0.5 group"
      style={{ backgroundColor: hovering ? "#2e3035" : "transparent" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer"
          style={{ backgroundColor: roleColor }}
        >
          {avatarLetter}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className="font-medium text-sm cursor-pointer hover:underline"
            style={{ color: roleColor }}
          >
            {username}
          </span>
          <span className="text-xs" style={{ color: "#949ba4" }}>
            {formatTimestamp(message.createdAt)}
          </span>
        </div>
        {editing ? (
          <EditBox
            value={editContent}
            onChange={setEditContent}
            onSave={handleEdit}
            onCancel={() => {
              setEditing(false);
              setEditContent(message.content);
            }}
          />
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
        {message.editedAt && !editing && (
          <span className="text-[10px]" style={{ color: "#949ba4" }}>
            (ред.)
          </span>
        )}
      </div>

      {hovering && !editing && (isFounder || isMod) && (
        <ActionButtons
          canEdit={!!isFounder}
          onEdit={() => setEditing(true)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function ActionButtons({
  canEdit,
  onEdit,
  onDelete,
}: {
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="absolute -top-3 right-4 flex items-center gap-0.5 rounded border px-1"
      style={{
        backgroundColor: "#2b2d31",
        borderColor: "#1e1f22",
      }}
    >
      {canEdit && (
        <button
          onClick={onEdit}
          className="p-1.5 rounded hover:brightness-125 transition-colors"
          style={{ color: "#b5bac1" }}
        >
          <Pencil size={16} />
        </button>
      )}
      <button
        onClick={onDelete}
        className="p-1.5 rounded hover:brightness-125 transition-colors"
        style={{ color: "#da373c" }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function EditBox({
  value,
  onChange,
  onSave,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded p-2 text-sm resize-none"
        style={{
          backgroundColor: "#383a40",
          color: "#dcddde",
          border: "none",
          outline: "none",
        }}
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSave();
          }
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="text-xs mt-1" style={{ color: "#949ba4" }}>
        Enter — сохранить · Esc — отмена
      </div>
    </div>
  );
}
