"use client";

import { useRef, type RefObject } from "react";
import { SquarePenIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { t } from "@/locales";

type NewChatButtonProps = {
  /** Nothing to delete yet. */
  disabled: boolean;
  onConfirm: () => void;
  /** Where to type next, focused after the chat is cleared. */
  composerRef: RefObject<HTMLTextAreaElement | null>;
};

// There is only one chat, so a new chat means deleting the current one,
// which can't be undone; the dialog says so.
export function NewChatButton({ disabled, onConfirm, composerRef }: NewChatButtonProps) {
  const confirmed = useRef(false);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="lg" disabled={disabled}>
          <SquarePenIcon />
          {t.chat.newChat}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          // After clearing, this button is disabled, so focus the composer
          // instead. Cancelling returns focus to the button as usual.
          if (!confirmed.current) return;
          confirmed.current = false;
          event.preventDefault();
          composerRef.current?.focus();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{t.chat.newChatTitle}</AlertDialogTitle>
          <AlertDialogDescription>{t.chat.newChatDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              confirmed.current = true;
              onConfirm();
            }}
          >
            {t.chat.newChatConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
