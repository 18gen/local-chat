import { SquareIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { t } from "@/locales";

export function StopButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <Button variant="outline" size="xl" onClick={onClick} className={className}>
      <SquareIcon className="fill-current" />
      {t.workflow.stop}
    </Button>
  );
}
