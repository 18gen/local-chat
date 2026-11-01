import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Workflow } from "@/features/workflow/workflows";
import { t } from "@/locales";

// The whole card is the link, so the click target is large.
export function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const text = t.workflow.items[workflow.id];
  const Icon = workflow.icon;

  return (
    <Link
      href={`/workflows/${workflow.id}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full transition-colors group-hover:bg-muted/40">
        <CardHeader className="gap-2">
          <span className="mb-1 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-6" aria-hidden />
          </span>
          <CardTitle className="text-lg">{text.title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {text.description}
          </CardDescription>
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
    </Link>
  );
}
