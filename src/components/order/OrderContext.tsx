"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";

export type OrderMode = "product" | "custom" | null;

export interface OrderPrefill {
  productId?: string;
  flavor?: string;
  design?: string;
}

interface OrderContextValue {
  isOpen: boolean;
  mode: OrderMode;
  prefill: OrderPrefill;
  /** Bumped every time a new order flow is opened — lets OrderPanel remount its form state via `key` instead of resetting state inside an effect. */
  sessionKey: number;
  openProductOrder: (prefill?: OrderPrefill) => void;
  openCustomOrder: () => void;
  close: () => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<OrderMode>(null);
  const [prefill, setPrefill] = useState<OrderPrefill>({});
  const [sessionKey, setSessionKey] = useState(0);

  const openProductOrder = useCallback((p: OrderPrefill = {}) => {
    setMode("product");
    setPrefill(p);
    setIsOpen(true);
    setSessionKey((k) => k + 1);
  }, []);

  const openCustomOrder = useCallback(() => {
    setMode("custom");
    setPrefill({});
    setIsOpen(true);
    setSessionKey((k) => k + 1);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, mode, prefill, sessionKey, openProductOrder, openCustomOrder, close }),
    [isOpen, mode, prefill, sessionKey, openProductOrder, openCustomOrder, close]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
