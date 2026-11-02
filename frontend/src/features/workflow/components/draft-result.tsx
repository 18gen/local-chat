"use client";

import { useEffect, useId, useRef } from "react";
import { CheckIcon, CopyIcon, RotateCcwIcon } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { t } from "@/locales";
import { StopButton } from "./stop-button";

type DraftResultProps = {
  draft: string;
  onChange: (draft: string) => void;
  /** Still being written: read-only, with a stop button. */
  generating: boolean;
  onStop: () => void;
  onReset: () => void;
};

export function DraftResult({ draft, onChange, generating, onStop, onReset }: DraftResultProps) {
  const section = useRef<HTMLElement>(null);
  const titleId = useId();
  const { state: copyState, copy } = useCopyToClipboard();

  useEffect(() => {
    section.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section ref={section} className="flex scroll-mt-4 flex-col gap-4">
      <Field>
        <div className="flex flex-wrap items-center gap-3">
          <h2 id={titleId} className="text-heading">
            {t.workflow.draftTitle}
          </h2>
          <Badge variant="warning">{t.workflow.aiDraftBadge}</Badge>
        </div>
        <Textarea
          aria-labelledby={titleId}
          value={draft}
          onChange={(event) => onChange(event.target.value)}
          readOnly={generating}
          className="min-h-80 p-2 text-body"
        />
        <FieldDescription>{t.workflow.draftReview}</FieldDescription>
      </Field>
      {generating ? (
        <StopButton onClick={onStop} className="self-start" />
      ) : (
        <div className="flex flex-wrap gap-3">
          <Button size="xl" onClick={() => void copy(draft)}>
            {copyState === "copied" ? <CheckIcon /> : <CopyIcon />}
            {t.copy[copyState]}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="xl">
                <RotateCcwIcon />
                {t.workflow.reset}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.workflow.resetTitle}</AlertDialogTitle>
                <AlertDialogDescription>{t.workflow.resetDescription}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.workflow.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={onReset}>{t.workflow.resetConfirm}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </section>
  );
}
