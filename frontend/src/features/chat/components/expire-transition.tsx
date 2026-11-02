import { ViewTransition, type ReactNode } from "react";

import { MESSAGE_EXPIRE_TRANSITION } from "@/features/chat/use-chat";

const ON_EXPIRE = {
  [MESSAGE_EXPIRE_TRANSITION]: "message-expire",
  default: "none",
};

// Animates only for deletions (styles in globals.css); sending and
// navigation stay instant.
export function ExpireTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={ON_EXPIRE} exit={ON_EXPIRE} update={ON_EXPIRE} default="none">
      {children}
    </ViewTransition>
  );
}
