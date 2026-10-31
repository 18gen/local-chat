"use client";

import { SquarePenIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useChatSession } from "@/features/chat/chat-session";
import { t } from "@/locales";

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
          tooltip={t.sidebar.newChat}
          onClick={() => {
            startNewChat();
            onNavigate?.();
          }}
        >
          <SquarePenIcon />
          <span>{t.sidebar.newChat}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
