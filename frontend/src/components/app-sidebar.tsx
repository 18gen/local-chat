"use client";

import { Kbd } from "@/components/ui/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AccountMenu } from "@/features/account/components/account-menu";
import { ChatNav } from "@/features/chat/components/chat-nav";
import { WorkflowNav } from "@/features/workflow/components/workflow-nav";
import { isMac } from "@/lib/platform";
import { t } from "@/locales";

// Rendered only inside the open tooltip, i.e. in the browser, so checking the
// OS here can't cause a server/client mismatch. Most hospital PCs are Windows.
function ToggleShortcut() {
  return <Kbd>{isMac() ? "⌘B" : "Ctrl+B"}</Kbd>;
}

export function AppSidebar() {
  const { isMobile, setOpenMobile, state } = useSidebar();

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
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Same 44px size and 20px icon as the menu buttons so they line up;
                  sidebar hover colors instead of the page's ghost button gray. */}
              <SidebarTrigger className="size-11 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-5!" />
            </TooltipTrigger>
            {/* Says what will happen, in both states. */}
            <TooltipContent side="right" sideOffset={12}>
              {state === "expanded" ? t.sidebar.close : t.sidebar.open}
              <ToggleShortcut />
            </TooltipContent>
          </Tooltip>
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
