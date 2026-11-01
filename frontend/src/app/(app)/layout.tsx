import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatProvider } from "@/features/chat/chat-provider";

// The chat lives here rather than in the chat page, so the conversation keeps
// going (and expiring) while other pages are open.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <ChatProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-svh">{children}</SidebarInset>
      </SidebarProvider>
    </ChatProvider>
  );
}
