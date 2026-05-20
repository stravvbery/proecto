"use client";

import { Menu, Users, Hash } from "lucide-react";

interface MobileTopBarProps {
  channelName: string;
  onOpenSidebar: () => void;
  onOpenMembers: () => void;
}

export function MobileTopBar({
  channelName,
  onOpenSidebar,
  onOpenMembers,
}: MobileTopBarProps) {
  return (
    <div
      className="flex items-center justify-between px-4 h-12 min-h-[48px] border-b"
      style={{ borderColor: "#1e1f22", backgroundColor: "#313338" }}
    >
      <button onClick={onOpenSidebar} className="p-1" style={{ color: "#b5bac1" }}>
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-1">
        <Hash size={16} style={{ color: "#80848e" }} />
        <span className="font-semibold text-sm" style={{ color: "#f2f3f5" }}>
          {channelName}
        </span>
      </div>
      <button onClick={onOpenMembers} className="p-1" style={{ color: "#b5bac1" }}>
        <Users size={22} />
      </button>
    </div>
  );
}
