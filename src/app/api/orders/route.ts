import { NextRequest, NextResponse } from "next/server";
import { saveOrder, saveUploadedImage } from "@/lib/orderStore";
import { generateOrderId } from "@/lib/format";
import { createNotification } from "@/lib/notificationStore";
import { incrementCouponUsage } from "@/lib/couponStore";
import type { OrderRecord } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.fullName || !body.phone || !body.productName || !body.preferredDate) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!body.termsAccepted) {
    return NextResponse.json({ error: "Terms & Conditions must be accepted." }, { status: 400 });
  }

  let referenceImage: string | null = null;
  if (typeof body.referenceImage === "string" && body.referenceImage.startsWith("data:image")) {
    referenceImage = await saveUploadedImage(body.referenceImage);
  }

  const now = new Date().toISOString();
  const order: OrderRecord = {
    orderId: generateOrderId(),
    kind: body.kind === "custom" ? "custom" : "product",
    status: "pending",
    createdAt: now,
    updatedAt: now,

    fullName: body.fullName,
    phone: body.phone,
    email: body.email || undefined,

    productId: body.productId || undefined,
    productName: body.productName,
    flavor: body.flavor || undefined,
    comboFlavor: body.comboFlavor || undefined,
    comboCupcakeFlavor: body.comboCupcakeFlavor || undefined,
    weight: body.weight || undefined,
    packSize: body.packSize || undefined,
    quantity: body.quantity || undefined,
    design: body.design || undefined,
    theme: body.theme || undefined,
    cakeColor: body.cakeColor || undefined,
    cakeMessage: body.cakeMessage || undefined,
    occasion: body.occasion || undefined,
    addOns: Array.isArray(body.addOns) && body.addOns.length ? body.addOns : undefined,
    specialInstructions: body.specialInstructions || undefined,
    referenceImage,

    fulfillment: body.fulfillment === "delivery" ? "delivery" : "pickup",
    deliveryAreaId: body.deliveryAreaId || undefined,
    address: body.address || undefined,
    preferredDate: body.preferredDate,
    preferredTime: body.preferredTime || undefined,
    pickupSlot: body.pickupSlot || undefined,

    deliveryCharge: body.deliveryCharge ?? null,
    itemPrice: body.itemPrice ?? null,
    total: body.total ?? null,

    termsAccepted: true,
    paymentStatus: "pending",
    couponCode: body.couponCode || undefined,
    discountAmount: body.discountAmount ?? undefined
  };

  await saveOrder(order);

  if (body.couponId) {
    await incrementCouponUsage(body.couponId);
  }

  await createNotification(
    order.kind === "custom"
      ? {
          type: "custom_request",
          title: "New custom cake request",
          message: `${order.fullName} requested a custom cake — ${order.productName}.`,
          orderId: order.orderId
        }
      : {
          type: "new_order",
          title: "New order placed",
          message: `${order.fullName} ordered ${order.productName}${order.total != null ? ` (₹${order.total})` : ""}.`,
          orderId: order.orderId
        }
  );

  return NextResponse.json({ orderId: order.orderId, status: order.status });
}
