"use client";

import { formatDateDivider } from "@/lib/utils";

interface DayDividerProps {
  date: string;
}

export function DayDivider({ date }: DayDividerProps) {
  return (
    <div className="flex items-center gap-2 px-4 my-4">
      <div className="flex-1 h-px" style={{ backgroundColor: "#3f4147" }} />
      <span className="text-xs font-semibold px-2" style={{ color: "#949ba4" }}>
        {formatDateDivider(date)}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: "#3f4147" }} />
    </div>
  );
}
