"use client";

import type { ComponentProps } from "react";

import { Kbd } from "@/components/ui/kbd";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isMac } from "@/lib/platform";
import { cn } from "@/lib/utils";
import { t } from "@/locales";

type SidebarToggleProps = Pick<
  ComponentProps<typeof TooltipContent>,
  "side" | "sideOffset"
> & {
  className?: string;
};

// Rendered only inside the open tooltip, i.e. in the browser, so checking the
// OS here can't cause a server/client mismatch. Most hospital PCs are Windows.
function ToggleShortcut() {
  return <Kbd>{isMac() ? "⌘B" : "Ctrl+B"}</Kbd>;
}

// Opens and closes the sidebar, from its header or, in narrow windows where
// the sidebar becomes a drawer, from the page header. Same 44px size and 20px
// icon as the sidebar's menu buttons.
export function SidebarToggle({ className, side, sideOffset }: SidebarToggleProps) {
  const { isMobile, open, openMobile } = useSidebar();
  // The drawer has its own open state, separate from the full sidebar's.
  const isOpen = isMobile ? openMobile : open;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger className={cn("size-11 [&_svg]:size-5!", className)} />
      </TooltipTrigger>
      {/* Says what will happen, in both states. */}
      <TooltipContent side={side} sideOffset={sideOffset}>
        {isOpen ? t.sidebar.close : t.sidebar.open}
        <ToggleShortcut />
      </TooltipContent>
    </Tooltip>
  );
}
