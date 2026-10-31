"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useChatSession } from "@/features/chat/chat-session";
import { t } from "@/locales";

type ChatHistoryProps = {
  /** Called after picking a chat, e.g. to close the mobile sidebar. */
  onNavigate?: () => void;
};

export function ChatHistory({ onNavigate }: ChatHistoryProps) {
  const { conversations, activeConversation, selectConversation } =
    useChatSession();

  return (
    // Chat titles have no icons, so the list is hidden when collapsed.
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t.sidebar.history}</SidebarGroupLabel>
      <SidebarGroupContent>
        {conversations.length === 0 ? (
          <p className="px-2 text-sm text-muted-foreground">
            {t.sidebar.historyEmpty}
          </p>
        ) : (
          <SidebarMenu>
            {conversations.map((conversation) => (
              <SidebarMenuItem key={conversation.id}>
                <SidebarMenuButton
                  isActive={conversation.id === activeConversation?.id}
                  onClick={() => {
                    selectConversation(conversation.id);
                    onNavigate?.();
                  }}
                >
                  <span>{conversation.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
