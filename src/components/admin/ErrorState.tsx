import { AlertTriangle } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this right now.",
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card p-12 text-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(180,72,60,0.1)" }}>
        <AlertTriangle size={22} color="var(--danger)" />
      </div>
      <p className="text-ink font-medium mb-1.5">{title}</p>
      <p className="text-text-muted text-[0.88rem] max-w-[380px] mx-auto mb-4">{description}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline btn-sm">
          Try Again
        </button>
      )}
    </div>
  );
}
