"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const USERS = [
  { username: "stravvbery", role: "Founder", color: "#5865F2" },
  { username: "Hixxivxq", role: "Senior Mod", color: "#c27c0e" },
  { username: "honda", role: "VIP", color: "#9b59b6" },
  { username: "ksynaxxxxx", role: "Игрок", color: "#b5bac1" },
  { username: "rrqxet", role: "VIP", color: "#9b59b6" },
  { username: "saishiku", role: "Helper", color: "#eb459e" },
  { username: "vntrpz", role: "Mod", color: "#23a559" },
];

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState("stravvbery");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: selectedUser }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("username", data.user.username);
        router.push("/app/srv-hondafx-legacy/ch-chat");
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#313338" }}>
      <div
        className="rounded-lg p-8 w-full max-w-md"
        style={{ backgroundColor: "#2b2d31" }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "#f2f3f5" }}>
            🛡️ SCP:SL · hondafx legacy
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#b5bac1" }}>
            Выберите аккаунт для входа
          </p>
        </div>

        <div className="space-y-2 mb-6">
          {USERS.map((user) => (
            <button
              key={user.username}
              onClick={() => setSelectedUser(user.username)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors"
              style={{
                backgroundColor:
                  selectedUser === user.username ? "#404249" : "transparent",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: user.color }}
              >
                {user.username[0].toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-medium" style={{ color: user.color }}>
                  {user.username}
                </div>
                <div className="text-xs" style={{ color: "#80848e" }}>
                  {user.role}
                </div>
              </div>
              {selectedUser === user.username && (
                <div className="ml-auto">
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: "#5865F2" }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-md font-medium text-white transition-colors"
          style={{
            backgroundColor: loading ? "#4752c4" : "#5865F2",
          }}
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </div>
    </div>
  );
}
