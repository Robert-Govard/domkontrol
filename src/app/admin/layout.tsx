import { AdminHeader } from "@/components/admin/AdminHeader";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <AdminHeader maxConnected={Boolean(config.maxBotToken)} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
