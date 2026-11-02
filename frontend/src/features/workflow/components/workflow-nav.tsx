"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGridIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFlip } from "@/hooks/use-flip";
import {
  onBeforeFavoritesChange,
  useFavoriteWorkflows,
} from "@/features/workflow/use-favorite-workflows";
import {
  sortByFavorite,
  workflowHref,
  WORKFLOWS,
} from "@/features/workflow/workflows";
import { t } from "@/locales";
import { FavoriteStarIcon } from "./favorite-star-icon";

type WorkflowNavProps = {
  onNavigate?: () => void;
};

export function WorkflowNav({ onNavigate }: WorkflowNavProps) {
  const pathname = usePathname();
  const { favorites, toggleFavorite } = useFavoriteWorkflows();
  const { containerRef, capture } = useFlip<HTMLUListElement>();

  // A star changed anywhere: record positions first.
  useEffect(() => onBeforeFavoritesChange(capture), [capture]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t.nav.workflows}</SidebarGroupLabel>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarGroupAction asChild>
            <Link href="/workflows" onClick={onNavigate}>
              <LayoutGridIcon />
              <span className="sr-only">{t.nav.workflowList}</span>
            </Link>
          </SidebarGroupAction>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={24}>
          {t.nav.workflowList}
        </TooltipContent>
      </Tooltip>
      <SidebarGroupContent>
        <SidebarMenu ref={containerRef}>
          {sortByFavorite(WORKFLOWS, favorites).map((workflow) => {
            const href = workflowHref(workflow.id);
            const active = pathname === href;
            const starred = favorites.includes(workflow.id);
            const title = t.workflow.items[workflow.id].title;
            return (
              <SidebarMenuItem key={workflow.id} data-flip-id={workflow.id}>
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
                <SidebarMenuAction
                  showOnHover={!starred}
                  aria-pressed={starred}
                  onClick={() => toggleFavorite(workflow.id)}
                >
                  <FavoriteStarIcon starred={starred} />
                  <span className="sr-only">{t.nav.favorite(title)}</span>
                </SidebarMenuAction>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
