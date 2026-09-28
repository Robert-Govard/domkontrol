import { Inbox, type LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon = Inbox, title, text, action }: { icon?: LucideIcon; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <div className="bg-dots mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-line">
        <Icon size={22} strokeWidth={1.75} className="text-ink-2" />
      </div>
      <p className="text-base font-semibold tracking-tight">{title}</p>
      {text && <p className="mt-1.5 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
