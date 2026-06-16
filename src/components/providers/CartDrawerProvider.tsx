"use client";

import { createContext, ReactNode, useContext } from "react";
import { useCart } from "@/store/cart";

const Ctx = createContext<ReturnType<typeof useCart> | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const cart = useCart();
  return <Ctx.Provider value={cart}>{children}</Ctx.Provider>;
}

export function useCartStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCartStore must be used within CartDrawerProvider");
  return v;
}
