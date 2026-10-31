"use client";

import { SquarePenIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useChatSession } from "@/features/chat/chat-session";

type NewChatButtonProps = {
  /** Called after starting a chat, e.g. to close the mobile sidebar. */
  onNavigate?: () => void;
};

export function NewChatButton({ onNavigate }: NewChatButtonProps) {
  const { startNewChat } = useChatSession();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="New chat"
          onClick={() => {
            startNewChat();
            onNavigate?.();
          }}
        >
          <SquarePenIcon />
          <span>New chat</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
