"use client";

import { createContext, useContext, ReactNode } from "react";
import type { BusinessSettings } from "@/lib/settingsStore";

const BusinessContext = createContext<BusinessSettings | null>(null);

export function BusinessProvider({ business, children }: { business: BusinessSettings; children: ReactNode }) {
  return <BusinessContext.Provider value={business}>{children}</BusinessContext.Provider>;
}

/** Live business settings (admin-editable), hydrated once from the server in the root layout. */
export function useBusiness(): BusinessSettings {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used within BusinessProvider");
  return ctx;
}
