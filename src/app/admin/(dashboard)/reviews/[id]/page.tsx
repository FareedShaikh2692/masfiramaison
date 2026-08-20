"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import StatusBadge, { type BadgeTone } from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { formatDate } from "@/lib/format";
import type { ReviewRecord, ReviewStatus } from "@/lib/reviewStore";

const STATUS_TONE: Record<ReviewStatus, BadgeTone> = {
  pending: "neutral",
  published: "success",
  rejected: "danger",
  reported: "danger"
};

const REPLY_ACTIONS: { action: string; label: string }[] = [
  { action: "shorter", label: "Make Shorter" },
  { action: "more_professional", label: "More Professional" },
  { action: "more_friendly", label: "More Friendly" },
  { action: "personal_touch", label: "Add Personal Touch" }
];

export default function AdminReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [review, setReview] = useState<ReviewRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews/${id}`);
    if (res.ok) {
      const data = await res.json();
      setReview(data.review);
      setDraft(data.review.responseText || "");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  async function runAi(action: string) {
    setAiBusy(action);
    try {
      const res = await fetch(`/api/admin/reviews/${id}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, draft })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI request failed.");
      setReview(data.review);
      if (data.review.responseText) setDraft(data.review.responseText);
      if (action === "analyze") showToast("Review analyzed.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setAiBusy(null);
    }
  }

  async function updateStatus(status: ReviewStatus) {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update.");
      setReview(data.review);
      showToast(`Review marked as ${status}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setSavingStatus(false);
    }
  }

  async function toggleGallery() {
    if (!review) return;
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showInGallery: !review.showInGallery })
    });
    const data = await res.json();
    if (res.ok) setReview(data.review);
  }

  async function saveDraft() {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseText: draft, responseStatus: "admin_edited", responseGeneratedBy: "admin" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setReview(data.review);
      showToast("Reply saved as draft.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setSavingStatus(false);
    }
  }

  async function publishReply() {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseText: draft, responseStatus: "published", status: "published" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not publish.");
      setReview(data.review);
      showToast("Review and reply published.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleDelete() {
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    showToast("Review deleted.");
    router.push("/admin/reviews");
  }

  if (loading) return <div className="card h-64 admin-skeleton" />;
  if (!review) {
    return (
      <div className="card p-12 text-center">
        <p className="text-text-muted mb-4">Review not found.</p>
        <Link href="/admin/reviews" className="btn btn-outline btn-sm">Back to Reviews</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[980px]">
      <Link href="/admin/reviews" className="text-text-muted text-[0.85rem] hover:text-gold-dark">&larr; Reviews</Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-1 mb-6">
        <h1 className="admin-page-title">{review.customerName}</h1>
        <StatusBadge label={review.status} tone={STATUS_TONE[review.status]} />
      </div>

      {review.moderationFlag === "needs_human_attention" && (
        <div className="flex items-start gap-3 rounded-[12px] px-4 py-3.5 mb-6" style={{ background: "rgba(180,72,60,0.08)" }}>
          <AlertTriangle size={18} color="var(--danger)" className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-ink font-medium m-0">Needs Human Attention</p>
            <p className="text-text-muted text-[0.85rem] m-0">This review may involve a serious concern. Please handle it personally rather than publishing an AI-drafted reply as-is.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-5">
          <div className="card p-5">
            <p className="field-label mb-3">Review</p>
            <div className="text-gold-dark text-[1.1rem] mb-2">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
            <p className="text-ink text-[0.95rem] mb-4">{review.reviewText}</p>
            <dl className="space-y-1.5 text-[0.85rem]">
              {review.productName && (
                <div className="flex justify-between"><dt className="text-text-muted">Product</dt><dd className="text-ink font-medium">{review.productName}</dd></div>
              )}
              {review.occasion && (
                <div className="flex justify-between"><dt className="text-text-muted">Occasion</dt><dd className="text-ink font-medium">{review.occasion}</dd></div>
              )}
              {review.orderId && (
                <div className="flex justify-between"><dt className="text-text-muted">Order</dt><dd className="text-ink font-medium">{review.orderId} {review.isVerified && <span className="text-gold-dark">✓ Verified</span>}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-text-muted">Date</dt><dd className="text-ink font-medium">{formatDate(review.createdAt.slice(0, 10))}</dd></div>
            </dl>
          </div>

          {review.images.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="field-label m-0">Photos</p>
                <button onClick={toggleGallery} className={`text-[0.75rem] px-2.5 py-1 rounded-full font-medium ${review.showInGallery ? "text-white" : "text-text-muted bg-blush-soft"}`} style={review.showInGallery ? { background: "var(--gold-dark)" } : undefined}>
                  {review.showInGallery ? "In Public Gallery" : "Show in Gallery"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {review.images.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={img} alt="" className="w-full aspect-square object-cover rounded-[10px] border border-border" />
                ))}
              </div>
            </div>
          )}

          <div className="card p-5">
            <p className="field-label mb-3">Moderation</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => updateStatus("published")} disabled={savingStatus} className="btn btn-primary btn-sm">Approve &amp; Publish</button>
              <button onClick={() => updateStatus("rejected")} disabled={savingStatus} className="btn btn-outline btn-sm">Reject</button>
              <button onClick={() => updateStatus("pending")} disabled={savingStatus} className="btn btn-outline btn-sm">Hide (Set Pending)</button>
              <button onClick={() => setDeleteOpen(true)} className="btn btn-sm text-white" style={{ background: "var(--danger)" }}>Delete</button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} color="var(--gold-dark)" />
              <p className="field-label m-0">AI Analysis</p>
            </div>
            {review.sentiment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="admin-badge" style={{ background: "var(--blush-soft)", color: "var(--gold-dark)" }}>{review.sentiment}</span>
                  {review.topics.map((t) => (
                    <span key={t} className="admin-badge" style={{ background: "var(--blush-soft)", color: "var(--text-muted)" }}>{t}</span>
                  ))}
                </div>
                {review.aiSummary && <p className="text-text-muted text-[0.85rem] italic m-0">&ldquo;{review.aiSummary}&rdquo;</p>}
              </div>
            ) : (
              <p className="text-text-muted text-[0.85rem] mb-3">Not analyzed yet.</p>
            )}
            <button onClick={() => runAi("analyze")} disabled={aiBusy === "analyze"} className="btn btn-outline btn-sm mt-3.5">
              {aiBusy === "analyze" ? "Analyzing…" : review.sentiment ? "Re-Analyze" : "Analyze Review"}
            </button>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} color="var(--gold-dark)" />
              <p className="field-label m-0">AI Reply Assistant</p>
            </div>

            {!draft ? (
              <button onClick={() => runAi("generate")} disabled={aiBusy === "generate"} className="btn btn-primary btn-sm">
                {aiBusy === "generate" ? "Generating…" : "Generate AI Reply"}
              </button>
            ) : (
              <>
                <textarea className="field-input min-h-[130px] mb-3" value={draft} onChange={(e) => setDraft(e.target.value)} />
                <div className="flex flex-wrap gap-2 mb-3">
                  <button onClick={() => runAi("regenerate")} disabled={!!aiBusy} className="btn btn-outline btn-sm">
                    {aiBusy === "regenerate" ? "…" : "Regenerate"}
                  </button>
                  {REPLY_ACTIONS.map((a) => (
                    <button key={a.action} onClick={() => runAi(a.action)} disabled={!!aiBusy} className="btn btn-outline btn-sm">
                      {aiBusy === a.action ? "…" : a.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2.5">
                  <button onClick={saveDraft} disabled={savingStatus} className="btn btn-outline flex-1">Save Draft</button>
                  <button onClick={publishReply} disabled={savingStatus} className="btn btn-primary flex-1">Approve &amp; Publish</button>
                </div>
              </>
            )}
            <p className="admin-caption mt-3">Always review AI-drafted replies before publishing — you can edit the text directly above.</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this review?"
        message="This review and its photos will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
