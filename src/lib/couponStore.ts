import { getSql } from "@/lib/db";

export interface CouponRecord {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number | null;
  categoryId: string | null;
  productId: string | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usageCount: number;
  active: boolean;
}

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    const sql = getSql();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL DEFAULT 'percentage',
        discount_value NUMERIC NOT NULL DEFAULT 0,
        min_order_amount NUMERIC,
        category_id UUID,
        product_id UUID,
        start_date DATE,
        end_date DATE,
        usage_limit INT,
        usage_count INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

function mapCoupon(r: Record<string, unknown>): CouponRecord {
  return {
    id: r.id as string,
    code: r.code as string,
    discountType: r.discount_type as CouponRecord["discountType"],
    discountValue: Number(r.discount_value),
    minOrderAmount: r.min_order_amount == null ? null : Number(r.min_order_amount),
    categoryId: (r.category_id as string) || null,
    productId: (r.product_id as string) || null,
    startDate: (r.start_date as string) || null,
    endDate: (r.end_date as string) || null,
    usageLimit: r.usage_limit == null ? null : Number(r.usage_limit),
    usageCount: Number(r.usage_count),
    active: r.active as boolean
  };
}

export async function listCoupons(): Promise<CouponRecord[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM coupons ORDER BY created_at DESC`;
  return rows.map(mapCoupon);
}

export interface CouponInput {
  code: string;
  discountType: CouponRecord["discountType"];
  discountValue: number;
  minOrderAmount: number | null;
  categoryId: string | null;
  productId: string | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  active?: boolean;
}

export async function createCoupon(input: CouponInput): Promise<CouponRecord> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, category_id, product_id, start_date, end_date, usage_limit, active)
    VALUES (
      ${input.code.toUpperCase()}, ${input.discountType}, ${input.discountValue}, ${input.minOrderAmount},
      ${input.categoryId}, ${input.productId}, ${input.startDate}, ${input.endDate}, ${input.usageLimit}, ${input.active ?? true}
    )
    RETURNING *
  `;
  return mapCoupon(rows[0]);
}

export async function updateCoupon(id: string, input: Partial<CouponInput>): Promise<CouponRecord | null> {
  await ensureTable();
  const sql = getSql();
  const existingRows = await sql`SELECT * FROM coupons WHERE id = ${id}`;
  if (!existingRows.length) return null;
  const existing = mapCoupon(existingRows[0]);
  const next = { ...existing, ...input };
  const rows = await sql`
    UPDATE coupons SET
      code = ${next.code.toUpperCase()}, discount_type = ${next.discountType}, discount_value = ${next.discountValue},
      min_order_amount = ${next.minOrderAmount}, category_id = ${next.categoryId}, product_id = ${next.productId},
      start_date = ${next.startDate}, end_date = ${next.endDate}, usage_limit = ${next.usageLimit}, active = ${next.active}
    WHERE id = ${id}
    RETURNING *
  `;
  return mapCoupon(rows[0]);
}

export async function deleteCoupon(id: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM coupons WHERE id = ${id}`;
}

export async function findActiveCouponByCode(code: string): Promise<CouponRecord | null> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM coupons WHERE code = ${code.toUpperCase()} AND active = true`;
  if (!rows.length) return null;
  return mapCoupon(rows[0]);
}

export async function incrementCouponUsage(id: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ${id}`;
}

/** Validates a coupon against order context and returns the discount amount (₹), or an error message. */
export function evaluateCoupon(
  coupon: CouponRecord,
  ctx: { orderAmount: number; categoryId?: string | null; productId?: string | null }
): { discount: number } | { error: string } {
  const today = new Date().toISOString().slice(0, 10);
  if (coupon.startDate && today < coupon.startDate) return { error: "This coupon isn't active yet." };
  if (coupon.endDate && today > coupon.endDate) return { error: "This coupon has expired." };
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) return { error: "This coupon has reached its usage limit." };
  if (coupon.minOrderAmount != null && ctx.orderAmount < coupon.minOrderAmount) {
    return { error: `This coupon requires a minimum order of ₹${coupon.minOrderAmount}.` };
  }
  if (coupon.categoryId && coupon.categoryId !== ctx.categoryId) return { error: "This coupon doesn't apply to this product." };
  if (coupon.productId && coupon.productId !== ctx.productId) return { error: "This coupon doesn't apply to this product." };

  const discount = coupon.discountType === "percentage" ? Math.round((ctx.orderAmount * coupon.discountValue) / 100) : coupon.discountValue;
  return { discount: Math.min(discount, ctx.orderAmount) };
}
