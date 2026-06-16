"use client";

import { ReactNode } from "react";
import { CartDrawerProvider } from "./CartDrawerProvider";

export function CartProvider({ children }: { children: ReactNode }) {
  return <CartDrawerProvider>{children}</CartDrawerProvider>;
}
