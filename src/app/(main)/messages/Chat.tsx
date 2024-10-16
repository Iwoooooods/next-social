"use client";

import { Chat as StreamChat } from "stream-chat-react";
import useInitializationChatClient from "./useInitializationChatClient";
import ChatSidebar from "./ChatSidebar";
import ChatChannel from "./ChatChannel";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function Chat() {
  const chatClient = useInitializationChatClient();

  const { resolvedTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!chatClient) return null;

  return (
    <div className="flex size-full min-h-[672px]">
      <StreamChat
        client={chatClient}
        theme={`${resolvedTheme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"}`}
      >
        <ChatSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <ChatChannel
          open={sidebarOpen}
          onOpen={() => setSidebarOpen(true)}
        />
      </StreamChat>
    </div>
  );
}
