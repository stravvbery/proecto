"use client";

import { Hash } from "lucide-react";

interface ChannelHeaderProps {
  channelName: string;
  channelTopic: string;
}

export function ChannelHeader({ channelName, channelTopic }: ChannelHeaderProps) {
  return (
    <div
      className="flex items-center gap-2 px-4 h-12 min-h-[48px] border-b"
      style={{ borderColor: "#1e1f22", backgroundColor: "#313338" }}
    >
      <Hash size={20} style={{ color: "#80848e" }} />
      <span className="font-semibold text-base" style={{ color: "#f2f3f5" }}>
        {channelName}
      </span>
      {channelTopic && (
        <>
          <div
            className="w-px h-6 mx-2"
            style={{ backgroundColor: "#3f4147" }}
          />
          <span className="text-sm truncate" style={{ color: "#b5bac1" }}>
            {channelTopic}
          </span>
        </>
      )}
    </div>
  );
}
