import type { ReactNode } from "react";

import { SidebarToggle } from "@/components/sidebar-toggle";

export function PageHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 px-3">
      {/* Narrow windows hide the sidebar entirely, so it needs an opener here. */}
      <SidebarToggle side="bottom" className="md:hidden" />
      {children}
    </header>
  );
}
