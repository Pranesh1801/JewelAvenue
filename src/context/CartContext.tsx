"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CartItem } from "@/data/types";

interface CartContextValue {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  cartIconRef: React.RefObject<HTMLButtonElement | null>;
  lastAdded: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const cartIconRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ja_cart");
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("ja_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((item: Omit<CartItem, "id" | "quantity">) => {
    const id = `${item.productId}-${item.variant ?? "default"}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, id, quantity: 1 }];
    });
    setLastAdded(id);
    setTimeout(() => setLastAdded(null), 2500);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getTotalPrice = useCallback(() =>
    items.reduce((sum, item) => {
      const num = parseFloat(item.price.replace(/[^\d.]/g, ""));
      return sum + (isNaN(num) ? 0 : num * item.quantity);
    }, 0),
  [items]);

  const getTotalItems = useCallback(() =>
    items.reduce((sum, item) => sum + item.quantity, 0),
  [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems, cartIconRef, lastAdded }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
