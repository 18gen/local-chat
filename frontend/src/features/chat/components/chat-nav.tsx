"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareTextIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { t } from "@/locales";

type ChatNavProps = {
  /** Called after following a link, e.g. to close the mobile sidebar. */
  onNavigate?: () => void;
};

export function ChatNav({ onNavigate }: ChatNavProps) {
  const active = usePathname() === "/";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t.nav.chatGroup}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={active} tooltip={t.nav.chat}>
              <Link
                href="/"
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              >
                <MessageSquareTextIcon />
                <span>{t.nav.chat}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
