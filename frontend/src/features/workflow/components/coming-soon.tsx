import Link from "next/link";
import { ClockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { t } from "@/locales";

export function ComingSoon() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClockIcon />
        </EmptyMedia>
        <EmptyTitle>{t.workflow.comingSoonTitle}</EmptyTitle>
        <EmptyDescription>{t.workflow.comingSoonDescription}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" asChild>
          <Link href="/workflows">{t.workflow.backToList}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
