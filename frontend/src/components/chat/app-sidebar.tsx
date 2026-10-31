"use client";

import { SquarePenIcon } from "lucide-react";

import { AccountMenu } from "@/components/account/account-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Conversation } from "./types";

type AppSidebarProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
};

export function AppSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
}: AppSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  // On mobile the sidebar is a drawer; close it after picking something.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <span className="px-2 text-sm font-semibold group-data-[collapsible=icon]:hidden">
            local-chat
          </span>
          {/* Same 32px size as the collapsed menu buttons so the icons line up. */}
          <SidebarTrigger size="icon" />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New chat"
              onClick={() => {
                onNewChat();
                closeOnMobile();
              }}
            >
              <SquarePenIcon />
              <span>New chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Chat titles have no icons, so the list is hidden when collapsed. */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            {conversations.length === 0 ? (
              <p className="px-2 text-xs text-muted-foreground">No chats yet</p>
            ) : (
              <SidebarMenu>
                {conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      isActive={conversation.id === activeId}
                      onClick={() => {
                        onSelect(conversation.id);
                        closeOnMobile();
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
      </SidebarContent>
      <SidebarFooter>
        <AccountMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
