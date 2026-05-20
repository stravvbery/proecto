"use client";

import { useParams } from "next/navigation";
import { useApp } from "../../layout";
import { ServerList } from "@/components/sidebar/ServerList";
import { ChannelList } from "@/components/sidebar/ChannelList";
import { ChatArea } from "@/components/chat/ChatArea";
import { MemberList } from "@/components/members/MemberList";
import { MobileTopBar } from "@/components/mobile/MobileTopBar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function ChatPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const serverId = params.serverId as string;
  const {
    isMobile,
    sidebarOpen,
    membersOpen,
    setSidebarOpen,
    setMembersOpen,
    channels,
  } = useApp();

  const currentChannel = channels
    .flatMap((g) => g.channels)
    .find((ch) => ch.id === channelId);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full w-full">
        <MobileTopBar
          channelName={currentChannel?.name || ""}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenMembers={() => setMembersOpen(true)}
        />
        <ChatArea channelId={channelId} serverId={serverId} />

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72" style={{ backgroundColor: "#2b2d31" }}>
            <div className="flex h-full">
              <ServerList />
              <ChannelList serverId={serverId} currentChannelId={channelId} />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={membersOpen} onOpenChange={setMembersOpen}>
          <SheetContent side="right" className="p-0 w-60" style={{ backgroundColor: "#2b2d31" }}>
            <MemberList />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <>
      <ServerList />
      <ChannelList serverId={serverId} currentChannelId={channelId} />
      <ChatArea channelId={channelId} serverId={serverId} />
      <MemberList />
    </>
  );
}
