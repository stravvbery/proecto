"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/app/layout";
import { Hash, ChevronDown, ChevronRight, Plus, Settings } from "lucide-react";
import { CreateChannelModal } from "@/components/modals/CreateChannelModal";
import { UserPanel } from "./UserPanel";

interface ChannelListProps {
  serverId: string;
  currentChannelId: string;
}

export function ChannelList({ serverId, currentChannelId }: ChannelListProps) {
  const { channels, user } = useApp();
  const router = useRouter();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [createChannelCategoryId, setCreateChannelCategoryId] = useState<string | null>(null);

  const isFounder = user?.roles.some((r) => r.name === "Founder");

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  return (
    <div
      className="flex flex-col h-full w-60 min-w-[240px]"
      style={{ backgroundColor: "#2b2d31" }}
    >
      {/* Server name header */}
      <div
        className="flex items-center justify-between px-4 h-12 min-h-[48px] border-b cursor-pointer hover:brightness-110"
        style={{ borderColor: "#1e1f22" }}
      >
        <span className="font-semibold text-sm truncate" style={{ color: "#f2f3f5" }}>
          SCP:SL · hondafx legacy
        </span>
        <ChevronDown size={16} style={{ color: "#b5bac1" }} />
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-2 pt-4 space-y-0.5">
        {channels.map((group) => {
          const isCollapsed = collapsedCategories.has(group.category.id);
          return (
            <div key={group.category.id} className="mb-1">
              {/* Category header */}
              <div
                className="flex items-center justify-between px-1 py-1 cursor-pointer group"
                onClick={() => toggleCategory(group.category.id)}
              >
                <div className="flex items-center gap-0.5">
                  {isCollapsed ? (
                    <ChevronRight size={10} style={{ color: "#949ba4" }} />
                  ) : (
                    <ChevronDown size={10} style={{ color: "#949ba4" }} />
                  )}
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#949ba4", letterSpacing: "0.02em" }}
                  >
                    {group.category.name}
                  </span>
                </div>
                {isFounder && (
                  <Plus
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ color: "#949ba4" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreateChannelCategoryId(group.category.id);
                    }}
                  />
                )}
              </div>

              {/* Channels */}
              {!isCollapsed &&
                group.channels.map((ch) => {
                  const isActive = ch.id === currentChannelId;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => router.push(`/app/${serverId}/${ch.id}`)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer group transition-colors"
                      style={{
                        backgroundColor: isActive ? "#404249" : "transparent",
                        color: isActive ? "#f2f3f5" : "#949ba4",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "#35363c";
                          (e.currentTarget as HTMLElement).style.color = "#dbdee1";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "#949ba4";
                        }
                      }}
                    >
                      <Hash size={18} className="shrink-0" />
                      <span className="text-sm truncate">{ch.name}</span>
                      {isFounder && (
                        <Settings
                          size={14}
                          className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "#949ba4" }}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>

      <UserPanel />

      {createChannelCategoryId && (
        <CreateChannelModal
          serverId={serverId}
          categoryId={createChannelCategoryId}
          onClose={() => setCreateChannelCategoryId(null)}
        />
      )}
    </div>
  );
}
