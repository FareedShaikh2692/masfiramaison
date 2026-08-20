import { notFound } from "next/navigation";
import { readOrders } from "@/lib/orderStore";
import { getBusinessSettings } from "@/lib/settingsStore";
import { listDeliveryZones } from "@/lib/deliveryStore";
import { formatCurrency, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import PrintButton from "./PrintButton";

export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const [orders, business, zones] = await Promise.all([readOrders(), getBusinessSettings(), listDeliveryZones()]);
  const order = orders.find((o) => o.orderId === orderId);

  if (!order) notFound();

  const isCustom = order.kind === "custom";
  const deliveryArea = order.deliveryAreaId ? zones.find((a) => a.id === order.deliveryAreaId) : undefined;

  const lineItems: { label: string; value: string }[] = [
    { label: "Product", value: order.productName },
    ...(order.flavor ? [{ label: "Flavor", value: order.flavor }] : []),
    ...(order.comboFlavor ? [{ label: "Bento Flavor", value: order.comboFlavor }] : []),
    ...(order.comboCupcakeFlavor ? [{ label: "Cupcake Flavor", value: order.comboCupcakeFlavor }] : []),
    ...(order.weight ? [{ label: "Weight", value: order.weight }] : []),
    ...(order.packSize ? [{ label: "Pack Size", value: order.packSize }] : []),
    ...(order.quantity ? [{ label: "Quantity", value: String(order.quantity) }] : []),
    ...(order.design ? [{ label: "Design", value: order.design }] : []),
    ...(order.theme ? [{ label: "Theme", value: order.theme }] : []),
    ...(order.cakeColor ? [{ label: "Cake Color", value: order.cakeColor }] : []),
    ...(order.cakeMessage ? [{ label: "Message on Cake", value: order.cakeMessage }] : []),
    ...(order.occasion ? [{ label: "Occasion", value: order.occasion }] : []),
    ...(order.addOns && order.addOns.length ? [{ label: "Add-ons", value: order.addOns.join(", ") }] : []),
    { label: "Fulfillment", value: order.fulfillment === "delivery" ? "Delivery" : "Pickup" },
    ...(order.fulfillment === "delivery" && deliveryArea ? [{ label: "Delivery Area", value: deliveryArea.name }] : []),
    ...(order.address ? [{ label: "Address", value: order.address }] : []),
    { label: "Date", value: formatDate(order.preferredDate) },
    ...(order.preferredTime ? [{ label: "Time Slot", value: order.preferredTime }] : []),
    ...(order.specialInstructions ? [{ label: "Special Instructions", value: order.specialInstructions }] : [])
  ];

  return (
    <div className="pt-[110px] pb-24 print:pt-8 print:pb-8">
      <div className="container-app max-w-[720px]">
        <div className="print:hidden mb-6 flex justify-end">
          <PrintButton />
        </div>

        <div className="card p-10 print:border-0 print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-border">
            <div>
              <h1 className="text-[1.7rem] mb-1">{business.name}</h1>
              <p className="text-[0.84rem] text-text-muted m-0">{business.addressLine}</p>
              <p className="text-[0.84rem] text-text-muted m-0">
                +{business.countryCode} {business.phone} &middot; {business.instagramHandle}
              </p>
            </div>
            <div className="text-right">
              <p className="eyebrow justify-end mb-2">{isCustom ? "Custom Request" : "Invoice"}</p>
              <p className="font-serif text-xl font-bold text-gold-dark m-0">{order.orderId}</p>
              <p className="text-[0.82rem] text-text-muted m-0">{formatDate(order.createdAt.slice(0, 10))}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-border">
            <div>
              <p className="text-[0.7rem] uppercase tracking-wide text-gold-dark font-semibold mb-1">Billed To</p>
              <p className="font-serif text-lg m-0">{order.fullName}</p>
              <p className="text-[0.84rem] text-text-muted m-0">{order.phone}{order.email ? ` · ${order.email}` : ""}</p>
            </div>
            <span className="px-4 py-1.5 rounded-full text-[0.72rem] font-semibold uppercase tracking-wide" style={{ background: "var(--blush-soft)", color: "var(--gold-dark)" }}>
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>

          <div className="py-6 border-b border-border">
            <p className="text-[0.7rem] uppercase tracking-wide text-gold-dark font-semibold mb-4">Order Details</p>
            <div className="space-y-2.5">
              {lineItems.map((item) => (
                <div key={item.label} className="flex justify-between gap-6 text-[0.9rem]">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="text-ink font-medium text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {order.total != null ? (
            <div className="py-6">
              <div className="flex justify-between py-1.5 text-[0.9rem]">
                <span className="text-text-muted">{isCustom ? "Base Price" : "Item Price"}</span>
                <span className="text-ink font-medium">{formatCurrency(order.itemPrice)}</span>
              </div>
              {isCustom && order.customDesignCharge != null && order.customDesignCharge > 0 && (
                <div className="flex justify-between py-1.5 text-[0.9rem]">
                  <span className="text-text-muted">Custom Design Charge</span>
                  <span className="text-ink font-medium">{formatCurrency(order.customDesignCharge)}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 text-[0.9rem]">
                <span className="text-text-muted">Delivery Charge</span>
                <span className="text-ink font-medium">
                  {order.fulfillment === "pickup" ? "Free (Pickup)" : formatCurrency(order.deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-3 mt-2 border-t-2 border-border">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-serif text-2xl font-bold text-gold-dark">{formatCurrency(order.total)}</span>
              </div>
              {order.paymentMethod && (
                <>
                  <div className="flex justify-between py-1.5 text-[0.9rem] mt-3">
                    <span className="text-text-muted">Advance Paid ({order.paymentMethod})</span>
                    <span className="text-ink font-medium">{formatCurrency(order.advancePaid ?? null)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-[0.9rem]">
                    <span className="text-text-muted">Balance Due</span>
                    <span className="text-ink font-medium">{formatCurrency(order.balanceDue ?? order.total)}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="pt-6 text-[0.88rem] text-text-muted italic">
              Final pricing for custom cakes is confirmed directly with {business.name} once the design is finalized.
            </p>
          )}

          <p className="pt-6 text-[0.76rem] text-text-muted border-t border-border mt-6">
            Order confirmed only after advance payment · No last-minute cancellations · No refund on custom cakes · Design may
            slightly vary as all items are handmade. See our full Terms &amp; Conditions for details.
          </p>
        </div>
      </div>
    </div>
  );
}
