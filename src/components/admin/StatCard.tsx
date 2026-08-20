import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="admin-label">{label}</span>
        <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--blush-soft)" }}>
          <Icon size={16} color="var(--gold-dark)" />
        </span>
      </div>
      <div className="font-serif text-[1.6rem] font-bold text-ink leading-none">{value}</div>
      {hint && <div className="admin-caption mt-2">{hint}</div>}
    </div>
  );
}
