"use client";

export function ServerList() {
  return (
    <div
      className="flex flex-col items-center py-3 gap-2 overflow-y-auto w-[72px] min-w-[72px]"
      style={{ backgroundColor: "#1e1f22" }}
    >
      {/* Server icon */}
      <div className="relative group">
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full transition-all"
          style={{ backgroundColor: "#f2f3f5" }}
        />
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg cursor-pointer transition-all hover:rounded-xl"
          style={{ backgroundColor: "#5865F2" }}
        >
          🛡️
        </div>
      </div>

      {/* Separator */}
      <div
        className="w-8 h-0.5 rounded-full mx-auto"
        style={{ backgroundColor: "#35363c" }}
      />

      {/* Add server button */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all hover:rounded-xl"
        style={{ backgroundColor: "#313338", color: "#23a559" }}
      >
        <span className="text-2xl">+</span>
      </div>
    </div>
  );
}
