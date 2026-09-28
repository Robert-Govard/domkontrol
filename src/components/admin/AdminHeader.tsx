import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ModeBadge } from "@/components/ui/ModeBadge";

export function AdminHeader({ maxConnected }: { maxConnected: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo href="/admin" />
          <span className="hidden text-sm text-muted md:inline">Панель управляющей компании</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex">
            <ModeBadge maxConnected={maxConnected} />
          </span>
          <Link
            href="/demo"
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-white transition hover:bg-ink-2"
          >
            Демо жителя <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
