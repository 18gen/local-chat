import { ViewTransition, type ReactNode } from "react";

import { MESSAGE_EXPIRE_TRANSITION } from "@/features/chat/use-chat";

const ON_EXPIRE = {
  [MESSAGE_EXPIRE_TRANSITION]: "message-expire",
  default: "none",
};

// Animates its child only while expired messages are deleted (styles in
// globals.css): it fades out when removed, fades in when added, and slides
// when it moves. Sending and page navigation stay instant.
export function ExpireTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={ON_EXPIRE} exit={ON_EXPIRE} update={ON_EXPIRE} default="none">
      {children}
    </ViewTransition>
  );
}
