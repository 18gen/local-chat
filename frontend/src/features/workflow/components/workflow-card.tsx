import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { workflowHref, type Workflow } from "@/features/workflow/workflows";
import { t } from "@/locales";
import { FavoriteStarIcon } from "./favorite-star-icon";

type WorkflowCardProps = {
  workflow: Workflow;
  starred: boolean;
  onToggleFavorite: () => void;
};

export function WorkflowCard({ workflow, starred, onToggleFavorite }: WorkflowCardProps) {
  const text = t.workflow.items[workflow.id];
  const Icon = workflow.icon;

  return (
    // The title link stretches over the whole card (a large click target),
    // and the star sits above it as its own button; a button can't be nested
    // inside a link.
    <Card className="relative h-full transition-colors hover:bg-muted/40 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50">
      <CardHeader className="gap-2">
        <span className="mb-1 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden />
        </span>
        <CardTitle className="text-lg">
          <Link
            href={workflowHref(workflow.id)}
            className="outline-none after:absolute after:inset-0"
          >
            {text.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {text.description}
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={starred}
            onClick={onToggleFavorite}
            className="relative z-10"
          >
            <FavoriteStarIcon starred={starred} />
            <span className="sr-only">{t.nav.favorite(text.title)}</span>
          </Button>
        </CardAction>
      </CardHeader>
      <CardFooter className="mt-auto">
        {workflow.kind === "draft" ? (
          <span className="inline-flex items-center gap-1 font-medium text-primary">
            {t.workflow.open}
            <ArrowRightIcon className="size-4" aria-hidden />
          </span>
        ) : (
          <Badge variant="secondary">{t.workflow.comingSoon}</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
