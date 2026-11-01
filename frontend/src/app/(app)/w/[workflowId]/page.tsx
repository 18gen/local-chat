import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { ResetOnLeave } from "@/components/reset-on-leave";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
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
}: PageProps<"/w/[workflowId]">): Promise<Metadata> {
  const workflow = getWorkflow((await params).workflowId);
  return workflow ? { title: t.workflow.items[workflow.id].title } : {};
}

// With Partial Prefetching every workflow link shares one App Shell, so the
// URL is only read inside <Suspense>, as in Next.js's "Move URL data behind
// Suspense" guide.
async function resolveWorkflow(
  params: PageProps<"/w/[workflowId]">["params"],
) {
  const workflow = getWorkflow((await params).workflowId);
  if (!workflow) notFound();
  return workflow;
}

async function WorkflowTitle({
  params,
}: Pick<PageProps<"/w/[workflowId]">, "params">) {
  const workflow = await resolveWorkflow(params);
  return <BreadcrumbPage>{t.workflow.items[workflow.id].title}</BreadcrumbPage>;
}

async function WorkflowDetails({
  params,
}: Pick<PageProps<"/w/[workflowId]">, "params">) {
  const workflow = await resolveWorkflow(params);
  const text = t.workflow.items[workflow.id];
  const Icon = workflow.icon;

  return (
    <>
      <div className="flex items-start gap-4">
        <span className="flex size-15 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-8" aria-hidden />
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
    </>
  );
}

function WorkflowDetailsSkeleton() {
  return (
    <div className="flex items-start gap-4">
      <Skeleton className="size-12 rounded-lg" />
      <div className="flex flex-1 flex-col gap-2 pt-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-full max-w-sm" />
      </div>
    </div>
  );
}

export default function WorkflowPage({
  params,
}: PageProps<"/w/[workflowId]">) {
  // Each run is for one patient, so nothing typed here outlives the visit.
  return (
    <ResetOnLeave>
      {/* A breadcrumb rather than a back button: it shows where this page
          sits, so the link to the list is right however you got here. */}
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/workflows">{t.workflow.homeTitle}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Suspense fallback={<Skeleton className="h-4 w-28" />}>
                <WorkflowTitle params={params} />
              </Suspense>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 pt-4 pb-12">
          <Suspense fallback={<WorkflowDetailsSkeleton />}>
            <WorkflowDetails params={params} />
          </Suspense>
        </div>
      </div>
    </ResetOnLeave>
  );
}
