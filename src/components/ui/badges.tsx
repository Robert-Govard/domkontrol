import {
  ArrowUpDown,
  DoorOpen,
  Droplet,
  Flame,
  Lightbulb,
  Sparkles,
  Trash2,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { CATEGORY_META, isCategory, isPriority, isStatus, PRIORITY_META, STATUS_META, type TicketStatus } from "@/lib/domain";

/** Цвет точки статуса — единственный «цветной» элемент в строке. */
export const STATUS_DOT: Record<TicketStatus, string> = {
  NEW: "bg-sky-500",
  ACCEPTED: "bg-brand-500",
  IN_PROGRESS: "bg-amber-400",
  DONE: "bg-emerald-500",
  REJECTED: "bg-rose-500",
};

const STATUS_TONE: Record<TicketStatus, string> = {
  NEW: "bg-sky-50 text-sky-700",
  ACCEPTED: "bg-brand-50 text-brand-700",
  IN_PROGRESS: "bg-amber-50 text-amber-800",
  DONE: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
};

export function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "lg" }) {
  if (!isStatus(status)) return <span className="text-xs">{status}</span>;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ${STATUS_TONE[status]} ${
        size === "lg" ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]} ${status === "IN_PROGRESS" ? "animate-pulse" : ""}`} />
      {STATUS_META[status].label}
    </span>
  );
}

/** Низкий/средний приоритет — тихий текст, высокий и авария — заметная метка. */
export function PriorityBadge({ priority, quiet = false }: { priority: string; quiet?: boolean }) {
  if (!isPriority(priority)) return null;
  const { label } = PRIORITY_META[priority];
  if (priority === "EMERGENCY") {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        {label}
      </span>
    );
  }
  if (priority === "HIGH") {
    return <span className="inline-flex whitespace-nowrap rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">{label}</span>;
  }
  if (quiet) return null;
  return <span className="text-[11px] font-medium whitespace-nowrap text-muted">{label}</span>;
}

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  WATER: Droplet,
  HEATING: Flame,
  ELECTRICITY: Lightbulb,
  ELEVATOR: ArrowUpDown,
  GARBAGE: Trash2,
  CLEANING: Sparkles,
  DOORS: DoorOpen,
  OTHER: Wrench,
};

export function CategoryIcon({ category, size = "md", tone = "light" }: { category: string; size?: "sm" | "md" | "lg"; tone?: "light" | "dark" }) {
  const Icon = CATEGORY_ICON[category] ?? Wrench;
  const dims = { sm: "h-8 w-8 rounded-xl", md: "h-10 w-10 rounded-2xl", lg: "h-14 w-14 rounded-2xl" }[size];
  const icon = { sm: 15, md: 18, lg: 24 }[size];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${dims} ${tone === "dark" ? "bg-white/10 text-white" : "border border-line bg-surface text-ink"}`}
      aria-hidden
    >
      <Icon size={icon} strokeWidth={1.75} />
    </span>
  );
}

export function categoryName(category: string): string {
  return isCategory(category) ? CATEGORY_META[category].short : category;
}
