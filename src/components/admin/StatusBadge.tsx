export type BadgeTone = "neutral" | "gold" | "success" | "danger";

const TONE_STYLES: Record<BadgeTone, { background: string; color: string }> = {
  neutral: { background: "var(--blush-soft)", color: "var(--text-muted)" },
  gold: { background: "var(--gold-dark)", color: "white" },
  success: { background: "#5A7D5A", color: "white" },
  danger: { background: "var(--danger)", color: "white" }
};

export default function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  return (
    <span className="admin-badge" style={TONE_STYLES[tone]}>
      {label}
    </span>
  );
}
