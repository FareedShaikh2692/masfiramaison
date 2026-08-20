"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, MessageSquareText } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge, { type BadgeTone } from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import type { ReviewRecord, ReviewStatus } from "@/lib/reviewStore";

interface Stats {
  total: number;
  averageRating: number;
  pending: number;
  withPhotos: number;
  withoutResponse: number;
  thisMonth: number;
}

const TABS: { value: ReviewStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "reported", label: "Reported" }
];

const STATUS_TONE: Record<ReviewStatus, BadgeTone> = {
  pending: "neutral",
  published: "success",
  rejected: "danger",
  reported: "danger"
};

function ReviewsList() {
  const router = useRouter();
  const params = useSearchParams();
  const status = (params.get("status") as ReviewStatus | null) || "all";
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ stats: "1" });
    if (status !== "all") qs.set("status", status);
    const res = await fetch(`/api/admin/reviews?${qs}`);
    const data = await res.json();
    setReviews(data.reviews || []);
    if (data.stats) setStats(data.stats);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  function setTab(value: string) {
    router.push(value === "all" ? "/admin/reviews" : `/admin/reviews?status=${value}`);
  }

  return (
    <div>
      <PageHeader title="Reviews" description="Moderate customer reviews and manage AI-assisted replies." />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-7">
          <StatCard icon={Star} label="Total Reviews" value={String(stats.total)} />
          <StatCard icon={Star} label="Average Rating" value={stats.averageRating ? `${stats.averageRating} / 5` : "—"} />
          <StatCard icon={MessageSquareText} label="Awaiting Approval" value={String(stats.pending)} />
          <StatCard icon={Star} label="With Photos" value={String(stats.withPhotos)} />
          <StatCard icon={MessageSquareText} label="Without a Reply" value={String(stats.withoutResponse)} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-full text-[0.85rem] font-medium border ${status === t.value ? "text-white border-transparent" : "text-ink border-border"}`}
            style={status === t.value ? { background: "var(--gold-dark)" } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No Reviews Yet" description="Customer reviews will appear here once they start coming in." />
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {reviews.map((r) => (
              <Link key={r.id} href={`/admin/reviews/${r.id}`} className="card p-4 block">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-gold-dark">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <StatusBadge label={r.status} tone={STATUS_TONE[r.status]} />
                </div>
                <div className="text-ink font-medium">{r.customerName}</div>
                <p className="text-text-muted text-[0.84rem] mt-1 line-clamp-2">{r.reviewText}</p>
              </Link>
            ))}
          </div>

          <div className="hidden sm:block card overflow-x-auto">
            <table className="w-full text-[0.86rem]">
              <thead>
                <tr className="border-b border-border text-left text-text-muted text-[0.72rem] uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Rating</th>
                  <th className="px-5 py-3 font-medium">Review</th>
                  <th className="px-5 py-3 font-medium">Photos</th>
                  <th className="px-5 py-3 font-medium">Response</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 cursor-pointer hover:bg-blush-soft/40" onClick={() => router.push(`/admin/reviews/${r.id}`)}>
                    <td className="px-5 py-3">
                      <div className="text-ink font-medium">{r.customerName}</div>
                      {r.productName && <div className="text-text-muted text-[0.78rem]">{r.productName}</div>}
                    </td>
                    <td className="px-5 py-3 text-gold-dark whitespace-nowrap">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</td>
                    <td className="px-5 py-3 text-ink max-w-[280px] truncate">{r.reviewText}</td>
                    <td className="px-5 py-3 text-text-muted">{r.images.length || "—"}</td>
                    <td className="px-5 py-3 text-text-muted capitalize">{r.responseStatus.replace(/_/g, " ")}</td>
                    <td className="px-5 py-3">
                      <StatusBadge label={r.status} tone={STATUS_TONE[r.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={null}>
      <ReviewsList />
    </Suspense>
  );
}
