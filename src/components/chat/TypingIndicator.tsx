"use client";

interface TypingIndicatorProps {
  typingUsers: Array<{ userId: string; username: string }>;
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.username);
  let text = "";
  if (names.length === 1) {
    text = `${names[0]} печатает`;
  } else if (names.length === 2) {
    text = `${names[0]} и ${names[1]} печатают`;
  } else {
    text = `${names[0]} и ещё ${names.length - 1} печатают`;
  }

  return (
    <div className="px-4 h-6 flex items-center gap-2">
      <div className="flex gap-0.5">
        <span className="typing-dot" />
        <span className="typing-dot" style={{ animationDelay: "0.2s" }} />
        <span className="typing-dot" style={{ animationDelay: "0.4s" }} />
      </div>
      <span className="text-xs font-medium" style={{ color: "#b5bac1" }}>
        {text}...
      </span>
    </div>
  );
}
