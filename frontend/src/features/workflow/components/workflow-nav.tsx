"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGridIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { WORKFLOWS } from "@/features/workflow/workflows";
import { t } from "@/locales";

type WorkflowNavProps = {
  /** Called after following a link, e.g. to close the mobile sidebar. */
  onNavigate?: () => void;
};

// Each workflow links straight to its page.
export function WorkflowNav({ onNavigate }: WorkflowNavProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t.nav.workflows}</SidebarGroupLabel>
      <SidebarGroupAction asChild title={t.nav.workflowList}>
        <Link href="/workflows" onClick={onNavigate}>
          <LayoutGridIcon />
          <span className="sr-only">{t.nav.workflowList}</span>
        </Link>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {WORKFLOWS.map((workflow) => {
            const href = `/workflows/${workflow.id}`;
            const active = pathname === href;
            const title = t.workflow.items[workflow.id].title;
            return (
              <SidebarMenuItem key={workflow.id}>
                <SidebarMenuButton asChild isActive={active} tooltip={title}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <workflow.icon />
                    <span>{title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
