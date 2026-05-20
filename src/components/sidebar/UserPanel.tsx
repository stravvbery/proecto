"use client";

import { useApp } from "@/app/app/layout";

export function UserPanel() {
  const { user, isConnected } = useApp();
  if (!user) return null;

  const topRole = user.roles.sort((a, b) => (b.position ?? 0) - (a.position ?? 0))[0];
  const color = topRole?.color || "#b5bac1";

  return (
    <div
      className="flex items-center gap-2 px-2 py-2 min-h-[52px]"
      style={{ backgroundColor: "#232428" }}
    >
      <div className="relative">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
          style={{ backgroundColor: color }}
        >
          {user.username[0].toUpperCase()}
        </div>
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
          style={{
            borderColor: "#232428",
            backgroundColor: isConnected ? "#23a559" : "#80848e",
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: "#f2f3f5" }}>
          {user.username}
        </div>
        <div className="text-xs truncate" style={{ color: "#b5bac1" }}>
          {isConnected ? "В сети" : "Не в сети"}
        </div>
      </div>
    </div>
  );
}
