import { randomBytes } from "crypto";
import { getSql } from "@/lib/db";

export type ReviewStatus = "pending" | "published" | "rejected" | "reported";
export type ReviewSentiment = "positive" | "neutral" | "negative";
export type ResponseStatus = "not_responded" | "ai_draft" | "admin_edited" | "published";

export interface ReviewRecord {
  id: string;
  customerName: string;
  customerPhone: string | null;
  orderId: string | null;
  productId: string | null;
  productName: string | null;
  occasion: string | null;
  rating: number;
  reviewText: string;
  images: string[];
  status: ReviewStatus;
  isVerified: boolean;
  showInGallery: boolean;
  sentiment: ReviewSentiment | null;
  topics: string[];
  aiSummary: string | null;
  moderationFlag: "needs_human_attention" | null;
  responseText: string | null;
  responseStatus: ResponseStatus;
  responseGeneratedBy: "ai" | "admin" | null;
  responsePublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const MAX_IMAGE_DATA_URL_LENGTH = 4 * 1024 * 1024;

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    const sql = getSql();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        order_id TEXT,
        product_id UUID,
        product_name TEXT,
        occasion TEXT,
        rating INT NOT NULL,
        review_text TEXT NOT NULL,
        images JSONB NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'pending',
        is_verified BOOLEAN NOT NULL DEFAULT false,
        show_in_gallery BOOLEAN NOT NULL DEFAULT false,
        sentiment TEXT,
        topics JSONB NOT NULL DEFAULT '[]',
        ai_summary TEXT,
        moderation_flag TEXT,
        response_text TEXT,
        response_status TEXT NOT NULL DEFAULT 'not_responded',
        response_generated_by TEXT,
        response_published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

function mapReview(r: Record<string, unknown>): ReviewRecord {
  return {
    id: r.id as string,
    customerName: r.customer_name as string,
    customerPhone: (r.customer_phone as string) || null,
    orderId: (r.order_id as string) || null,
    productId: (r.product_id as string) || null,
    productName: (r.product_name as string) || null,
    occasion: (r.occasion as string) || null,
    rating: Number(r.rating),
    reviewText: r.review_text as string,
    images: (r.images as string[]) || [],
    status: r.status as ReviewStatus,
    isVerified: r.is_verified as boolean,
    showInGallery: r.show_in_gallery as boolean,
    sentiment: (r.sentiment as ReviewSentiment) || null,
    topics: (r.topics as string[]) || [],
    aiSummary: (r.ai_summary as string) || null,
    moderationFlag: (r.moderation_flag as "needs_human_attention") || null,
    responseText: (r.response_text as string) || null,
    responseStatus: r.response_status as ResponseStatus,
    responseGeneratedBy: (r.response_generated_by as "ai" | "admin") || null,
    responsePublishedAt: (r.response_published_at as string) || null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string
  };
}

export interface ReviewInput {
  customerName: string;
  customerPhone?: string | null;
  orderId?: string | null;
  productId?: string | null;
  productName?: string | null;
  occasion?: string | null;
  rating: number;
  reviewText: string;
  images?: string[];
  isVerified?: boolean;
}

export async function createReview(input: ReviewInput, requireApproval: boolean): Promise<ReviewRecord> {
  await ensureTable();
  const sql = getSql();
  const images = (input.images || []).filter((i) => i.length <= MAX_IMAGE_DATA_URL_LENGTH).slice(0, 5);
  const rows = await sql`
    INSERT INTO reviews (
      customer_name, customer_phone, order_id, product_id, product_name, occasion,
      rating, review_text, images, status, is_verified
    ) VALUES (
      ${input.customerName}, ${input.customerPhone || null}, ${input.orderId || null},
      ${input.productId || null}, ${input.productName || null}, ${input.occasion || null},
      ${input.rating}, ${input.reviewText}, ${JSON.stringify(images)}::jsonb,
      ${requireApproval ? "pending" : "published"}, ${input.isVerified ?? false}
    )
    RETURNING *
  `;
  return mapReview(rows[0]);
}

export async function listReviews(opts: { status?: ReviewStatus } = {}): Promise<ReviewRecord[]> {
  await ensureTable();
  const sql = getSql();
  const rows = opts.status
    ? await sql`SELECT * FROM reviews WHERE status = ${opts.status} ORDER BY created_at DESC`
    : await sql`SELECT * FROM reviews ORDER BY created_at DESC`;
  return rows.map(mapReview);
}

export async function getReviewById(id: string): Promise<ReviewRecord | null> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM reviews WHERE id = ${id}`;
  if (!rows.length) return null;
  return mapReview(rows[0]);
}

export interface ReviewPatch {
  status?: ReviewStatus;
  showInGallery?: boolean;
  sentiment?: ReviewSentiment | null;
  topics?: string[];
  aiSummary?: string | null;
  moderationFlag?: "needs_human_attention" | null;
  responseText?: string | null;
  responseStatus?: ResponseStatus;
  responseGeneratedBy?: "ai" | "admin" | null;
  responsePublishedAt?: string | null;
}

export async function updateReview(id: string, patch: ReviewPatch): Promise<ReviewRecord | null> {
  await ensureTable();
  const sql = getSql();
  const existingRows = await sql`SELECT * FROM reviews WHERE id = ${id}`;
  if (!existingRows.length) return null;
  const existing = mapReview(existingRows[0]);
  const next = { ...existing, ...patch };
  const rows = await sql`
    UPDATE reviews SET
      status = ${next.status}, show_in_gallery = ${next.showInGallery},
      sentiment = ${next.sentiment}, topics = ${JSON.stringify(next.topics)}::jsonb,
      ai_summary = ${next.aiSummary}, moderation_flag = ${next.moderationFlag},
      response_text = ${next.responseText}, response_status = ${next.responseStatus},
      response_generated_by = ${next.responseGeneratedBy}, response_published_at = ${next.responsePublishedAt},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return mapReview(rows[0]);
}

export async function deleteReview(id: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM reviews WHERE id = ${id}`;
}

export async function getPublishedReviews(opts: { withPhotosOnly?: boolean; minRating?: number } = {}): Promise<ReviewRecord[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM reviews WHERE status = 'published' ORDER BY created_at DESC`;
  let reviews = rows.map(mapReview);
  if (opts.withPhotosOnly) reviews = reviews.filter((r) => r.images.length > 0);
  if (opts.minRating) reviews = reviews.filter((r) => r.rating >= opts.minRating!);
  return reviews;
}

export async function getGalleryPhotos(): Promise<{ review: ReviewRecord; image: string }[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM reviews WHERE status = 'published' AND show_in_gallery = true ORDER BY created_at DESC`;
  const reviews = rows.map(mapReview);
  return reviews.flatMap((review) => review.images.map((image) => ({ review, image })));
}

export async function reviewStats(): Promise<{
  total: number;
  averageRating: number;
  distribution: Record<number, number>;
  pending: number;
  withPhotos: number;
  withoutResponse: number;
  thisMonth: number;
}> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM reviews`;
  const reviews = rows.map(mapReview);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;
  const now = new Date();
  let thisMonth = 0;
  for (const r of reviews) {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    ratingSum += r.rating;
    const created = new Date(r.createdAt);
    if (created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()) thisMonth += 1;
  }
  return {
    total: reviews.length,
    averageRating: reviews.length ? Math.round((ratingSum / reviews.length) * 10) / 10 : 0,
    distribution,
    pending: reviews.filter((r) => r.status === "pending").length,
    withPhotos: reviews.filter((r) => r.images.length > 0).length,
    withoutResponse: reviews.filter((r) => r.responseStatus === "not_responded" && r.status !== "rejected").length,
    thisMonth
  };
}

/** Secure token issued when an order is marked completed — lets the customer land on a pre-filled review form without exposing order data in the URL. */
export function generateReviewToken(): string {
  return randomBytes(24).toString("base64url");
}
