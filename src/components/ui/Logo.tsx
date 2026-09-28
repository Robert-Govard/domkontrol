import Link from "next/link";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center rounded-[30%] bg-ink text-white" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 24 24" width={size * 0.52} height={size * 0.52} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11 12 4l8 7" />
        <path d="M6.5 9.5V20h11V9.5" />
      </svg>
      <span className="bg-brand-gradient absolute -right-0.5 -top-0.5 rounded-full ring-2 ring-surface" style={{ width: size * 0.3, height: size * 0.3 }} />
    </span>
  );
}

export function Logo({ subtitle = false, href = "/" }: { subtitle?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-tight">ДомКонтроль</span>
        {subtitle && <span className="block text-xs text-muted">Проблемы дома — без потерянных сообщений</span>}
      </span>
    </Link>
  );
}
