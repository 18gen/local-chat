import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Chat messages are held by the chat page itself, not here, so leaving the
// chat screen discards the conversation.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-svh">{children}</SidebarInset>
    </SidebarProvider>
  );
}
