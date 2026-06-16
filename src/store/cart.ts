"use client";

import { create } from "./createStore";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  unitPrice: number;
  image: string;
  quantity: number;
};

type State = {
  items: CartItem[];
  isOpen: boolean;
};

type Actions = {
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const STORAGE_KEY = "boucherie_cart_v1";
let storageHydrated = false;

function loadInitial(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

const store = create<State & Actions>((set, get) => ({
  items: [],
  isOpen: false,
  add: (item, qty = 1) => {
    const items = [...get().items];
    const idx = items.findIndex((i) => i.productId === item.productId);
    if (idx >= 0) items[idx] = { ...items[idx], quantity: items[idx].quantity + qty };
    else items.push({ ...item, quantity: qty });
    set({ items, isOpen: true });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  },
  remove: (productId) => {
    const items = get().items.filter((i) => i.productId !== productId);
    set({ items });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  },
  setQty: (productId, qty) => {
    const items = get()
      .items.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, qty) }
          : i
      );
    set({ items });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  },
  clear: () => {
    set({ items: [] });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  },
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set({ isOpen: !get().isOpen }),
}));

// Hydrate from localStorage on first client mount to avoid SSR mismatch
if (typeof window !== "undefined" && !storageHydrated) {
  storageHydrated = true;
  queueMicrotask(() => {
    const items = loadInitial();
    if (items.length) {
      store.setState({ items });
    }
  });
}

export const useCart = store.useStore;

export function selectCount(state: State) {
  return state.items.reduce((s, i) => s + i.quantity, 0);
}
export function selectSubtotal(state: State) {
  return state.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
}
