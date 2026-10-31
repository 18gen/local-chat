import { t } from "@/locales";

export function TypingIndicator() {
  return (
    <div className="flex gap-1 py-2" role="status" aria-label={t.chat.typing}>
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground" />
    </div>
  );
}
