import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-24">
      <EmptyState icon={Compass} title="Страница не найдена" action={<ButtonLink href="/">На главную</ButtonLink>} />
    </main>
  );
}
