"use client";

import { useState } from "react";
import { InfoIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  countExpired,
  isTtlOption,
  TTL_OPTIONS_MS,
} from "@/features/chat/message-retention";
import { formatDuration } from "@/features/chat/time-format";
import type { ChatMessage } from "@/features/chat/types";
import { t } from "@/locales";

type RetentionSelectProps = {
  ttlMs: number;
  onTtlChange: (ttlMs: number) => void;
  messages: ChatMessage[];
};

export function RetentionSelect({ ttlMs, onTtlChange, messages }: RetentionSelectProps) {
  // A shorter time that would delete messages waits for confirmation.
  const [pending, setPending] = useState<{ ttlMs: number; count: number } | null>(
    null,
  );
  const lifetime = formatDuration(ttlMs);

  const handleChange = (value: string) => {
    const next = Number(value);
    if (!isTtlOption(next)) return;
    const now = Date.now();
    const count = countExpired(messages, now, next);
    if (count > 0) setPending({ ttlMs: next, count });
    else onTtlChange(next);
  };

  return (
    <>
      <div className="ml-auto flex items-center gap-1.5 text-caption">
        <Select value={String(ttlMs)} onValueChange={handleChange}>
          <SelectTrigger aria-label={t.chat.autoDeleteLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectGroup>
              {TTL_OPTIONS_MS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {t.chat.autoDeleteOption(formatDuration(option))}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className="whitespace-nowrap">{t.chat.autoDeleteSuffix}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t.chat.autoDeleteInfo}
              className="text-muted-foreground"
            >
              <InfoIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" className="whitespace-pre-line">
            {t.chat.autoDeleteHelp(lifetime)}
          </TooltipContent>
        </Tooltip>
      </div>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.chat.shortenTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.chat.shortenDescription(pending?.count ?? 0)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) onTtlChange(pending.ttlMs);
              }}
            >
              {t.chat.shortenConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
