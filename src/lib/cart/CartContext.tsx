"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { menu, type MenuItem } from "@/lib/data/menu";

export type CartLine = { slug: string; qty: number };

export type CartItem = {
  slug: string;
  qty: number;
  item: MenuItem;
};

type CartContextValue = {
  cart: CartLine[];
  items: CartItem[];
  total: number;
  totalQty: number;
  hydrated: boolean;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  getQty: (slug: string) => number;
  // Drawer state
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "komals-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load from localStorage on first mount (client-only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Strip any items whose slug no longer exists in the menu.
          const valid = new Set(menu.map((m) => m.slug));
          setCart(
            parsed.filter(
              (p): p is CartLine =>
                p &&
                typeof p.slug === "string" &&
                valid.has(p.slug) &&
                typeof p.qty === "number" &&
                p.qty > 0,
            ),
          );
        }
      }
    } catch {
      // ignore storage errors
    }
    setHydrated(true);
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore quota / privacy errors
    }
  }, [cart, hydrated]);

  const setQty = useCallback((slug: string, qty: number) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.slug === slug);
      if (qty <= 0) return prev.filter((p) => p.slug !== slug);
      if (!exists) return [...prev, { slug, qty }];
      return prev.map((p) => (p.slug === slug ? { ...p, qty } : p));
    });
  }, []);

  const add = useCallback((slug: string) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.slug === slug);
      if (!exists) return [...prev, { slug, qty: 1 }];
      return prev.map((p) =>
        p.slug === slug ? { ...p, qty: p.qty + 1 } : p,
      );
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.slug === slug);
      if (!exists) return prev;
      if (exists.qty <= 1) return prev.filter((p) => p.slug !== slug);
      return prev.map((p) =>
        p.slug === slug ? { ...p, qty: p.qty - 1 } : p,
      );
    });
  }, []);

  const clear = useCallback(() => setCart([]), []);

  const items = useMemo<CartItem[]>(() => {
    const map = new Map(menu.map((m) => [m.slug, m]));
    return cart
      .map((l) => {
        const item = map.get(l.slug);
        if (!item) return null;
        return { ...l, item };
      })
      .filter((x): x is CartItem => !!x);
  }, [cart]);

  const total = useMemo(
    () => items.reduce((s, l) => s + l.qty * l.item.price, 0),
    [items],
  );

  const totalQty = useMemo(
    () => cart.reduce((s, l) => s + l.qty, 0),
    [cart],
  );

  const getQty = useCallback(
    (slug: string) => cart.find((c) => c.slug === slug)?.qty ?? 0,
    [cart],
  );

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((v) => !v), []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      items,
      total,
      totalQty,
      hydrated,
      add,
      remove,
      setQty,
      clear,
      getQty,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [
      cart,
      items,
      total,
      totalQty,
      hydrated,
      add,
      remove,
      setQty,
      clear,
      getQty,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
