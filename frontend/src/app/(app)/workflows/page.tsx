import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { WorkflowGrid } from "@/features/workflow/components/workflow-grid";
import { t } from "@/locales";

export const metadata: Metadata = {
  title: t.workflow.homeTitle,
};

export default function WorkflowsPage() {
  return (
    <>
      <PageHeader />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 pt-4 pb-12">
          <h1 className="text-2xl font-semibold">{t.workflow.homeTitle}</h1>
          <p className="mt-2 text-base text-muted-foreground">
            {t.workflow.homeDescription}
          </p>
          <div className="mt-8">
            <WorkflowGrid />
          </div>
        </div>
      </div>
    </>
  );
}
