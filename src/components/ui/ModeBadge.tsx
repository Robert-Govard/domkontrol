export function ModeBadge({ maxConnected }: { maxConnected: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-ink-2">
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${maxConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${maxConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
      </span>
      {maxConnected ? "MAX API подключён" : "Демо-режим"}
    </span>
  );
}
