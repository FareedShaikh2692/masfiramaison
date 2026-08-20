import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card p-12 text-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--blush-soft)" }}>
        <Icon size={22} color="var(--gold-dark)" />
      </div>
      <p className="text-ink font-medium mb-1.5">{title}</p>
      {description && <p className="text-text-muted text-[0.88rem] max-w-[380px] mx-auto mb-4">{description}</p>}
      {action}
    </div>
  );
}
