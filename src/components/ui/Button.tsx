import Link from "next/link";

const variants = {
  primary: "bg-ink text-white hover:bg-ink-2",
  accent: "bg-brand-gradient text-white hover:brightness-110",
  ghost: "border border-line bg-canvas text-ink hover:bg-surface",
} as const;

type Variant = keyof typeof variants;

const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 h-11 text-sm font-medium transition active:scale-[0.98]";

export function ButtonLink({ href, variant = "primary", children, external }: { href: string; variant?: Variant; children: React.ReactNode; external?: boolean }) {
  return (
    <Link href={href} className={`${base} ${variants[variant]}`} {...(external ? { target: "_blank" } : {})}>
      {children}
    </Link>
  );
}

export function buttonClass(variant: Variant = "primary") {
  return `${base} ${variants[variant]}`;
}
