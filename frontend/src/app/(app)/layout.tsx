import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatProvider } from "@/features/chat/chat-provider";

// Here rather than in the chat page, so the chat keeps running on other pages.
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
