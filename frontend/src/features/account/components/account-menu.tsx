"use client";

import { useRef, useState } from "react";
import { SettingsIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { mockUser } from "@/features/account/mock-user";
import { SettingsDialog } from "./settings-dialog";
import { UserAvatar } from "./user-avatar";

export function AccountMenu() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                ref={triggerRef}
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserAvatar />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium">{mockUser.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {mockUser.plan}
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              onCloseAutoFocus={(event) => {
                // Settings is about to take focus; don't pull it back here.
                if (settingsOpen) event.preventDefault();
              }}
            >
              <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
                <SettingsIcon />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onCloseAutoFocus={(event) => {
          // The menu item that opened the dialog is gone; return focus to the
          // account button instead.
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      />
    </>
  );
}
