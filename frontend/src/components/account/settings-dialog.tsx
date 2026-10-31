"use client";

import type { ComponentProps } from "react";
import { useTheme } from "next-themes";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { mockUser } from "@/lib/mock-user";
import { UserAvatar } from "./user-avatar";

const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

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
  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription className="sr-only">
            Account summary and appearance preferences.
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-medium text-muted-foreground">Account</h3>
          <div className="flex items-center gap-3">
            <UserAvatar size="lg" />
            <div className="min-w-0">
              <p className="truncate font-medium">{mockUser.name}</p>
              <p className="truncate text-muted-foreground">{mockUser.email}</p>
            </div>
            <span className="ml-auto rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
              {mockUser.plan}
            </span>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-medium text-muted-foreground">
            Appearance
          </h3>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="theme-select">Theme</Label>
            <Select value={theme ?? "system"} onValueChange={setTheme}>
              <SelectTrigger id="theme-select" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
