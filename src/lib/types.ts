/**
 * Core domain types for Masfira Maison.
 * Keeping these in one place is what makes the product catalog,
 * delivery rules and order workflow easy to extend into an admin
 * dashboard later — the UI just renders whatever satisfies these shapes.
 */

export type FulfillmentType = "pickup" | "delivery";

/**
 * Order lifecycle. Nothing in the app is allowed to jump straight to
 * "confirmed" — that transition only happens once a human at Masfira
 * Maison has actually verified the advance payment.
 */
export type OrderStatus =
  | "pending" // request received, payment not yet started
  | "payment_pending" // customer is on the payment step
  | "payment_verification" // payment screenshot submitted, awaiting manual check
  | "confirmed" // payment verified by the business
  | "preparing"
  | "ready"
  | "completed";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Order Request Received",
  payment_pending: "Payment Pending",
  payment_verification: "Payment Verification Pending",
  confirmed: "Order Confirmed",
  preparing: "Preparing Your Cake",
  ready: "Ready For Pickup / Delivery",
  completed: "Completed"
};

/** Which optional customization fields a given product exposes in the order form. */
export type ProductFieldKey =
  | "flavor"
  | "weight"
  | "design"
  | "message"
  | "quantity"
  | "comboFlavor"
  | "comboCupcakeFlavor"
  | "specialInstructions";

export interface WeightOption {
  label: string;
  value: string;
  priceAdd: number | null;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  /** Starting price in INR. `null` renders "Price on request" until configured. */
  price: number | null;
  flavors?: string[];
  /** Falls back to the global WEIGHTS list from data.ts when omitted. */
  weightOptions?: WeightOption[];
  fields: ProductFieldKey[];
  badge?: string;
  /** Richer visual treatment for the Maison Specials shelf. */
  featured?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface DeliveryArea {
  id: string;
  name: string;
  /** INR. `null` = "as per delivery service charges", not a fixed fee. */
  charge: number | null;
}

export interface PaymentMethodConfig {
  id: "googlepay" | "upi" | "paytm";
  label: string;
  /** Identifier to pay to (UPI ID / phone number). Left blank until configured. */
  identifier: string | null;
}

export interface GalleryItem {
  id: number;
  category: string;
  image: string;
  alt: string;
}

export interface Testimonial {
  rating: number;
  text: string;
  name: string;
}

/** Shape persisted by the order API — see src/lib/orderStore.ts */
export interface OrderRecord {
  orderId: string;
  kind: "product" | "custom";
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;

  fullName: string;
  phone: string;
  email?: string;

  productId?: string;
  productName: string;
  flavor?: string;
  comboFlavor?: string;
  comboCupcakeFlavor?: string;
  weight?: string;
  quantity?: number;
  design?: string;
  theme?: string;
  cakeColor?: string;
  cakeMessage?: string;
  specialInstructions?: string;
  referenceImage?: string | null;

  fulfillment: FulfillmentType;
  deliveryAreaId?: string;
  address?: string;
  preferredDate: string;
  preferredTime?: string;

  deliveryCharge: number | null;
  itemPrice: number | null;
  total: number | null;

  termsAccepted: boolean;
  paymentMethod?: PaymentMethodConfig["id"];
  paymentScreenshot?: string | null;
}
