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
    // scheme-dark gives the navy sidebar a dark native scrollbar.
    <Sidebar collapsible="icon" className="scheme-dark">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <span className="px-3 text-base font-semibold group-data-[collapsible=icon]:hidden">
            {t.app.name}
          </span>
          {/* Same 44px size and 20px icon as the menu buttons so they line up;
              sidebar hover colors instead of the page's ghost button gray. */}
          <SidebarTrigger className="size-11 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-5!" />
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
