import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ComingSoon } from "@/features/workflow/components/coming-soon";
import { DraftWorkflow } from "@/features/workflow/components/draft-workflow";
import { getWorkflow, WORKFLOWS } from "@/features/workflow/workflows";
import { t } from "@/locales";

// Prerender every built-in workflow. Cache Components requires at least one.
export function generateStaticParams() {
  return WORKFLOWS.map((workflow) => ({ workflowId: workflow.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/workflows/[workflowId]">): Promise<Metadata> {
  const workflow = getWorkflow((await params).workflowId);
  return workflow ? { title: t.workflow.items[workflow.id].title } : {};
}

export default async function WorkflowPage({
  params,
}: PageProps<"/workflows/[workflowId]">) {
  const workflow = getWorkflow((await params).workflowId);
  if (!workflow) notFound();

  const text = t.workflow.items[workflow.id];
  const Icon = workflow.icon;

  return (
    <>
      <PageHeader>
        <span className="font-medium">{text.title}</span>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 pt-2 pb-12">
          <Button variant="ghost" asChild className="-ml-2 text-muted-foreground">
            <Link href="/workflows">
              <ArrowLeftIcon />
              {t.workflow.backToList}
            </Link>
          </Button>
          <div className="mt-4 flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-semibold">{text.title}</h1>
              <p className="mt-1 text-base text-muted-foreground">{text.description}</p>
            </div>
          </div>
          <div className="mt-8">
            {workflow.kind === "draft" ? (
              <DraftWorkflow workflowId={workflow.id} />
            ) : (
              <ComingSoon />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
