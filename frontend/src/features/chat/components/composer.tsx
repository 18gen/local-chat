"use client";

import { useState, type Ref } from "react";
import { ArrowUpIcon, SquareIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/locales";

type ComposerProps = {
  onSend: (text: string) => void;
  pending?: boolean;
  onStop?: () => void;
  ref?: Ref<HTMLTextAreaElement>;
};

export function Composer({ onSend, pending = false, onStop, ref }: ComposerProps) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !pending;

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
        ref={ref}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          // Not while an IME is composing: Safari reports the confirming Enter
          // with isComposing false but keyCode 229.
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
        className="max-h-52 text-body py-1 pl-3 resize-none border-0 bg-transparent shadow-none"
      />
      {pending ? (
        <Button
          type="button"
          size="icon-lg"
          onClick={onStop}
          aria-label={t.composer.stop}
          className="shrink-0 rounded-full"
        >
          <SquareIcon className="size-4 fill-current" />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon-lg"
          disabled={!canSend}
          aria-label={t.composer.send}
          className="shrink-0 rounded-full"
        >
          <ArrowUpIcon className="size-5" />
        </Button>
      )}
    </form>
  );
}
