"use client";

import type { ComponentProps } from "react";
import { CommandIcon } from "lucide-react";

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

// Rendered only in the open tooltip, i.e. in the browser, so checking the OS
// can't mismatch hydration. ⌘ is an icon: the character draws too thin.
function ToggleShortcut() {
  return (
    <Kbd className="gap-0.5">
      {isMac() ? (
        <>
          <CommandIcon />B
        </>
      ) : (
        "Ctrl+B"
      )}
    </Kbd>
  );
}

export function SidebarToggle({ className, side, sideOffset }: SidebarToggleProps) {
  const { isMobile, open, openMobile } = useSidebar();
  const isOpen = isMobile ? openMobile : open;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger className={cn("size-11 [&_svg]:size-5!", className)} />
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={sideOffset}>
        {isOpen ? t.sidebar.close : t.sidebar.open}
        <ToggleShortcut />
      </TooltipContent>
    </Tooltip>
  );
}
