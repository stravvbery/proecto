"use client";

import { useState } from "react";
import { useApp } from "@/app/app/layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateChannelModalProps {
  serverId: string;
  categoryId: string;
  onClose: () => void;
}

export function CreateChannelModal({
  serverId,
  categoryId,
  onClose,
}: CreateChannelModalProps) {
  const { refreshChannels } = useApp();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await fetch(`/api/servers/${serverId}/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, "-"),
        topic,
        categoryId,
        type: "text",
      }),
    });
    refreshChannels();
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="border-0"
        style={{ backgroundColor: "#313338", color: "#f2f3f5" }}
      >
        <DialogHeader>
          <DialogTitle>Создать канал</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold uppercase" style={{ color: "#b5bac1" }}>
              Имя канала
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="новый-канал"
              className="w-full mt-1 rounded px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "#1e1f22", color: "#dcddde" }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase" style={{ color: "#b5bac1" }}>
              Тема (необязательно)
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="О чём этот канал?"
              className="w-full mt-1 rounded px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "#1e1f22", color: "#dcddde" }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm"
              style={{ color: "#b5bac1" }}
            >
              Отмена
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="px-4 py-2 rounded text-sm text-white font-medium"
              style={{ backgroundColor: "#5865F2", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Создание..." : "Создать"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
