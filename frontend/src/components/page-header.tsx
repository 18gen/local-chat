import type { ReactNode } from "react";

import { SidebarToggle } from "@/components/sidebar-toggle";

// The top bar shared by every screen.
export function PageHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 px-3">
      {/* In narrow windows the closed sidebar is fully hidden, so it needs an opener here. */}
      <SidebarToggle side="bottom" className="md:hidden" />
      {children}
    </header>
  );
}
