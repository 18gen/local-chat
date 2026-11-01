"use client";

import { useState } from "react";
import { ArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/locales";

type ComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function Composer({ onSend, disabled = false }: ComposerProps) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 rounded-4xl border bg-composer p-2 shadow-xs"
    >
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          // Enter sends, Shift+Enter adds a newline. Skip while an IME
          // (e.g. Japanese input) is composing so confirming a word doesn't send.
          // Safari reports the confirming Enter with isComposing false, but
          // with keyCode 229, so check both.
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing &&
            event.nativeEvent.keyCode !== 229
          ) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={t.composer.placeholder}
        aria-label={t.composer.label}
        rows={1}
        autoFocus
        className="max-h-52 leading-7 py-1 pl-3 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <Button
        type="submit"
        size="icon-lg"
        disabled={!canSend}
        aria-label={t.composer.send}
        className="shrink-0 rounded-full"
      >
        <ArrowUpIcon className="size-5" />
      </Button>
    </form>
  );
}
