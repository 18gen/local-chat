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
  disabled: boolean;
  onConfirm: () => void;
  composerRef: RefObject<HTMLTextAreaElement | null>;
};

export function NewChatButton({ disabled, onConfirm, composerRef }: NewChatButtonProps) {
  const confirmed = useRef(false);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="lg" disabled={disabled}>
          <SquarePenIcon />
          {/* Phones show the icon alone, so the header fits. */}
          <span className="max-sm:sr-only">{t.chat.newChat}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          // The button is disabled after clearing, so the composer takes focus.
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
