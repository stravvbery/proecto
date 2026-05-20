"use client";

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useIsMobile } from "@/hooks/useMediaQuery";
import type { User, ChannelGroup, MemberWithRoles, Role } from "@/types";

interface AppContextType {
  user: (User & { roles: Role[]; serverId: string }) | null;
  channels: ChannelGroup[];
  members: MemberWithRoles[];
  roles: Role[];
  onlineUsers: string[];
  token: string | null;
  isConnected: boolean;
  isMobile: boolean;
  sidebarOpen: boolean;
  membersOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setMembersOpen: (open: boolean) => void;
  refreshChannels: () => void;
  refreshMembers: () => void;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  notifyMessage: (channelId: string, content: string) => void;
  socket: ReturnType<typeof useSocket>["socket"];
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppLayout");
  return ctx;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fetchData(serverId: string, setter: (data: any) => void, endpoint: string) {
  fetch(`/api/servers/${serverId}/${endpoint}`)
    .then((r) => r.json())
    .then(setter);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<AppContextType["user"]>(null);
  const [channels, setChannels] = useState<ChannelGroup[]>([]);
  const [members, setMembers] = useState<MemberWithRoles[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [token] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [membersOpen, setMembersOpen] = useState(!isMobile);
  const userRef = useRef<AppContextType["user"]>(null);

  const { socket, isConnected, onlineUsers, joinChannel, leaveChannel, notifyMessage } =
    useSocket(token);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/login");
          return;
        }
        setUser(data);
        userRef.current = data;
        fetchData(data.serverId, setChannels, "channels");
        fetchData(data.serverId, setMembers, "members");
        fetchData(data.serverId, setAllRoles, "roles");
      });
  }, [token, router]);

  const refreshChannels = useCallback(() => {
    const u = userRef.current;
    if (u?.serverId) {
      fetchData(u.serverId, setChannels, "channels");
    }
  }, []);

  const refreshMembers = useCallback(() => {
    const u = userRef.current;
    if (u?.serverId) {
      fetchData(u.serverId, setMembers, "members");
    }
  }, []);

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#313338", color: "#b5bac1" }}
      >
        Загрузка...
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        user,
        channels,
        members,
        roles: allRoles,
        onlineUsers,
        token,
        isConnected,
        isMobile,
        sidebarOpen,
        membersOpen,
        setSidebarOpen,
        setMembersOpen,
        refreshChannels,
        refreshMembers,
        joinChannel,
        leaveChannel,
        notifyMessage,
        socket,
      }}
    >
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "#313338" }}>
        {children}
      </div>
    </AppContext.Provider>
  );
}
