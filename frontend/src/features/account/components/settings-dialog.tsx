"use client";

import type { ComponentProps } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockUser } from "@/features/account/mock-user";
import { t } from "@/locales";
import { UserAvatar } from "./user-avatar";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: ComponentProps<typeof DialogContent>["onCloseAutoFocus"];
};

export function SettingsDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>{t.settings.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {t.settings.description}
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-medium text-muted-foreground">
            {t.settings.account}
          </h3>
          <div className="flex items-center gap-3">
            <UserAvatar size="lg" />
            <div className="min-w-0">
              <p className="truncate font-medium">{mockUser.name}</p>
              <p className="truncate text-muted-foreground">{mockUser.email}</p>
            </div>
            <span className="ml-auto rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
              {t.account.plans[mockUser.plan]}
            </span>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
