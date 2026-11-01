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
import { ChatNav } from "@/features/chat/components/chat-nav";
import { WorkflowNav } from "@/features/workflow/components/workflow-nav";
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
      </SidebarHeader>
      <SidebarContent>
        <ChatNav onNavigate={closeOnMobile} />
        <WorkflowNav onNavigate={closeOnMobile} />
      </SidebarContent>
      <SidebarFooter>
        <AccountMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
