"use client";

import { useEffect, useEffectEvent } from "react";
import { CommandIcon, CornerDownLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { useIsMac } from "@/hooks/use-is-mac";
import { t } from "@/locales";

type GenerateButtonProps = {
  generating: boolean;
  disabled: boolean;
  onGenerate: () => void;
};

/** Also pressed by ⌘Enter or Ctrl+Enter from anywhere on the screen. */
export function GenerateButton({ generating, disabled, onGenerate }: GenerateButtonProps) {
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    if (event.isComposing || event.repeat || disabled) return;
    const target = event.target;
    if (target instanceof Element && target.closest('[role="dialog"], [role="alertdialog"]')) {
      return;
    }
    event.preventDefault();
    onGenerate();
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => onKeyDown(event);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Button
      size="xl"
      onClick={onGenerate}
      disabled={disabled}
      aria-keyshortcuts="Meta+Enter Control+Enter"
    >
      {generating && <Spinner data-icon="inline-start" aria-hidden />}
      {generating ? t.workflow.generating : t.workflow.generate}
      {!generating && <ShortcutHint />}
    </Button>
  );
}

// Icons: the ⌘ and ⏎ characters draw too thin. Screen readers get
// aria-keyshortcuts instead.
function ShortcutHint() {
  const mac = useIsMac();
  if (mac === null) return null;
  return (
    <Kbd
      data-icon="inline-end"
      aria-hidden
      className="h-6 min-w-6 translate-x-0.5 gap-0.5 bg-primary-foreground/20 px-1.5 text-caption text-primary-foreground [&_svg:not([class*='size-'])]:size-3.5"
    >
      {mac ? (
        <>
          <CommandIcon />
          <CornerDownLeftIcon />
        </>
      ) : (
        "Ctrl+Enter"
      )}
    </Kbd>
  );
}
