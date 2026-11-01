import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";

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

// Replaces Next.js's English default for unknown URLs and unknown workflows.
export default function NotFound() {
  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle>{t.notFound.title}</EmptyTitle>
        <EmptyDescription>{t.notFound.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/">{t.notFound.back}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
