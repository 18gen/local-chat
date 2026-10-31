"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AccountMenu } from "@/features/account/components/account-menu";
import { ChatHistory } from "@/features/chat/components/chat-history";
import { NewChatButton } from "@/features/chat/components/new-chat-button";
import { t } from "@/locales";

export function AppSidebar() {
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
            {t.app.name}
          </span>
          {/* Same 32px size as the collapsed menu buttons so the icons line up. */}
          <SidebarTrigger size="icon" />
        </div>
        <NewChatButton onNavigate={closeOnMobile} />
      </SidebarHeader>
      <SidebarContent>
        <ChatHistory onNavigate={closeOnMobile} />
      </SidebarContent>
      <SidebarFooter>
        <AccountMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
