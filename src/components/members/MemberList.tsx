"use client";

import { useApp } from "@/app/app/layout";
import { MemberItem } from "./MemberItem";

export function MemberList() {
  const { members, onlineUsers, roles } = useApp();

  const sortedRoles = [...roles].sort((a, b) => (b.position ?? 0) - (a.position ?? 0));

  const groupedMembers: Record<string, typeof members> = {};
  for (const member of members) {
    const topRole = member.roles[0];
    const roleName = topRole?.name || "Участник";
    if (!groupedMembers[roleName]) {
      groupedMembers[roleName] = [];
    }
    groupedMembers[roleName].push(member);
  }

  const orderedGroups = sortedRoles
    .filter((r) => groupedMembers[r.name]?.length)
    .map((r) => ({
      roleName: r.name,
      color: r.color || "#b5bac1",
      members: groupedMembers[r.name],
    }));

  return (
    <div
      className="w-60 min-w-[240px] h-full overflow-y-auto pt-4"
      style={{
        backgroundColor: "#2b2d31",
        scrollbarWidth: "thin",
        scrollbarColor: "#1a1b1e #2b2d31",
      }}
    >
      {orderedGroups.map((group) => (
        <div key={group.roleName} className="mb-4">
          <div
            className="text-xs font-semibold uppercase tracking-wide px-4 mb-1"
            style={{ color: "#949ba4" }}
          >
            {group.roleName} — {group.members.length}
          </div>
          {group.members.map((member) => (
            <MemberItem
              key={member.id}
              member={member}
              isOnline={onlineUsers.includes(member.id)}
              roleColor={member.roles[0]?.color || "#b5bac1"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
