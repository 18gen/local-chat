import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatSessionProvider } from "@/features/chat/chat-session";
import { ChatView } from "@/features/chat/components/chat-view";

export default function Home() {
  return (
    <ChatSessionProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-svh">
          <ChatView />
        </SidebarInset>
      </SidebarProvider>
    </ChatSessionProvider>
  );
}
