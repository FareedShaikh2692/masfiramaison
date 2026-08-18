"use client";

import { useEffect, useState } from "react";
import { useOrder, OrderMode, OrderPrefill } from "@/components/order/OrderContext";
import ProductOrderForm, { OrderSnapshot } from "@/components/order/ProductOrderForm";
import CustomCakeForm, { CustomOrderSnapshot } from "@/components/order/CustomCakeForm";
import PaymentStep from "@/components/order/PaymentStep";
import ConfirmationStep from "@/components/order/ConfirmationStep";
import { formatDate } from "@/lib/format";

type Step = "form" | "payment" | "confirmation";

function buildProductWaMessage(s: OrderSnapshot) {
  return [
    "Hello Masfira Maison, I've completed my advance payment.",
    "",
    `Order ID: ${s.orderId}`,
    `Name: ${s.fullName}`,
    `Product: ${s.productName}`,
    s.flavor ? `Flavor: ${s.flavor}` : null,
    s.comboFlavor ? `Bento Flavor: ${s.comboFlavor}` : null,
    s.comboCupcakeFlavor ? `Cupcake Flavor: ${s.comboCupcakeFlavor}` : null,
    s.weight ? `Weight: ${s.weight}` : null,
    s.quantity ? `Quantity: ${s.quantity}` : null,
    s.design ? `Design: ${s.design}` : null,
    s.cakeMessage ? `Cake Message: ${s.cakeMessage}` : null,
    `Delivery/Pickup: ${s.fulfillment === "delivery" ? "Delivery" : "Pickup"}`,
    s.address ? `Address: ${s.address}` : null,
    `Date: ${formatDate(s.preferredDate)}`,
    s.preferredTime ? `Time: ${s.preferredTime}` : null,
    s.specialInstructions ? `Additional Notes: ${s.specialInstructions}` : null,
    "",
    "Please verify my payment and confirm the order."
  ]
    .filter(Boolean)
    .join("\n");
}

function buildCustomWaMessage(s: CustomOrderSnapshot) {
  return [
    "Hello Masfira Maison, I'd like to submit a custom cake request.",
    "",
    `Order ID: ${s.orderId}`,
    `Name: ${s.fullName}`,
    `Cake Type: ${s.cakeType}`,
    `Flavor: ${s.flavor}`,
    `Weight: ${s.weight}`,
    `Design: ${s.design}`,
    s.theme ? `Theme: ${s.theme}` : null,
    s.cakeColor ? `Cake Color: ${s.cakeColor}` : null,
    s.cakeMessage ? `Cake Message: ${s.cakeMessage}` : null,
    `Preferred Date: ${formatDate(s.preferredDate)}`,
    s.preferredTime ? `Preferred Time: ${s.preferredTime}` : null,
    s.specialInstructions ? `Requirements: ${s.specialInstructions}` : null,
    "",
    "Please confirm availability and pricing."
  ]
    .filter(Boolean)
    .join("\n");
}

/** Owns the actual form/payment/confirmation flow. Remounted fresh (via `key`) every time a new order session starts, so it never needs to reset its own state from an effect. */
function OrderPanelContent({ mode, prefill, onClose }: { mode: OrderMode; prefill: OrderPrefill; onClose: () => void }) {
  const [step, setStep] = useState<Step>("form");
  const [productSnapshot, setProductSnapshot] = useState<OrderSnapshot | null>(null);
  const [customSnapshot, setCustomSnapshot] = useState<CustomOrderSnapshot | null>(null);

  const titles: Record<string, { title: string; subtitle: string }> = {
    "product-form": { title: "Create Your Cake Order", subtitle: "Tell us what you'd like, and we'll prepare something special for you." },
    "product-payment": { title: "Advance Payment", subtitle: "Your order is confirmed only after payment is verified." },
    "product-confirmation": { title: "Order Received", subtitle: "" },
    "custom-form": { title: "Request A Custom Cake", subtitle: "Your Cake. Your Story. Tell us everything and we'll bring it to life." },
    "custom-confirmation": { title: "Request Received", subtitle: "" }
  };
  const heading = titles[`${mode}-${step}`] || titles["product-form"];

  return (
    <>
      <div className="px-6 sm:px-8 pt-7 pb-5 bg-ivory border-b border-border flex items-start justify-between gap-4">
        <div>
          <h2 id="orderPanelTitle" className="text-[1.6rem] mb-1.5">
            {heading.title}
          </h2>
          {heading.subtitle && <p className="text-text-muted text-[0.9rem] m-0">{heading.subtitle}</p>}
        </div>
        <button onClick={onClose} aria-label="Close order form" className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[1.3rem] text-ink flex-shrink-0" style={{ background: "var(--blush-soft)" }}>
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-7">
        {mode === "product" && step === "form" && (
          <ProductOrderForm
            prefill={prefill}
            onOrderCreated={(s) => {
              setProductSnapshot(s);
              setStep("payment");
            }}
          />
        )}

        {mode === "product" && step === "payment" && productSnapshot && (
          <PaymentStep orderId={productSnapshot.orderId} total={productSnapshot.total} onConfirmed={() => setStep("confirmation")} />
        )}

        {mode === "product" && step === "confirmation" && productSnapshot && (
          <ConfirmationStep
            orderId={productSnapshot.orderId}
            heading="Your Order Request Has Been Received ❤️"
            message="Thank you for choosing Masfira Maison. We've received your payment details and will verify them shortly to confirm your order."
            statusLabel="Payment Verification Pending"
            waMessage={buildProductWaMessage(productSnapshot)}
            onBackHome={onClose}
          />
        )}

        {mode === "custom" && step === "form" && (
          <CustomCakeForm
            onOrderCreated={(s) => {
              setCustomSnapshot(s);
              setStep("confirmation");
            }}
          />
        )}

        {mode === "custom" && step === "confirmation" && customSnapshot && (
          <ConfirmationStep
            orderId={customSnapshot.orderId}
            heading="Custom Cake Request Received"
            message="Thank you for your custom cake request. Masfira Maison will contact you shortly to discuss the design, availability, and final price."
            statusLabel="Awaiting Confirmation"
            waMessage={buildCustomWaMessage(customSnapshot)}
            onBackHome={onClose}
          />
        )}
      </div>
    </>
  );
}

export default function OrderPanel() {
  const { isOpen, mode, prefill, sessionKey, close } = useOrder();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <div
      className={`fixed inset-0 z-[1000] flex justify-end transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ background: "rgba(64,51,42,0.55)" }}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="orderPanelTitle"
        className={`relative w-full sm:w-[560px] h-full bg-cream shadow-[-30px_0_60px_rgba(0,0,0,0.2)] flex flex-col transition-transform duration-400 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {mode && <OrderPanelContent key={sessionKey} mode={mode} prefill={prefill} onClose={close} />}
      </div>
    </div>
  );
}
