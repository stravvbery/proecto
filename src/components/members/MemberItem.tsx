"use client";

import { useState } from "react";
import type { MemberWithRoles } from "@/types";

interface MemberItemProps {
  member: MemberWithRoles;
  isOnline: boolean;
  roleColor: string;
}

export function MemberItem({ member, isOnline, roleColor }: MemberItemProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="flex items-center gap-3 px-2 mx-2 py-1.5 rounded cursor-pointer transition-colors"
      style={{ backgroundColor: hovering ? "#35363c" : "transparent" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
          style={{
            backgroundColor: roleColor,
            opacity: isOnline ? 1 : 0.4,
          }}
        >
          {member.username[0].toUpperCase()}
        </div>
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
          style={{
            borderColor: "#2b2d31",
            backgroundColor: isOnline ? "#23a559" : "#80848e",
          }}
        />
      </div>
      <span
        className="text-sm truncate"
        style={{
          color: roleColor,
          opacity: isOnline ? 1 : 0.5,
        }}
      >
        {member.username}
      </span>
    </div>
  );
}
