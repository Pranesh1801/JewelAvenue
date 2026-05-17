"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/home/Navbar";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, clearCart, getTotalPrice, getTotalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const total = getTotalPrice();
  const count = getTotalItems();
  const tax = total * 0.03;

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white">
      <Navbar phase="always" fixed={false} />

      <div className="w-[min(860px,calc(100vw-2rem))] mx-auto pt-10 pb-20">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <h1
            style={{
              fontFamily: "var(--font-brand), Georgia, serif",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#0a0a0a",
            }}
          >
            Your Cart
          </h1>
          {/* Gold divider */}
          <div style={{ height: 2, width: 80, margin: "14px auto 0", background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", borderRadius: 999 }} />
        </motion.div>

        {count === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 gap-6"
          >
            <span style={{ fontSize: "2.5rem" }}>✦</span>
            <p style={{ fontFamily: "var(--font-brand), Georgia, serif", fontSize: "1.2rem", color: "#555", letterSpacing: "0.08em", textAlign: "center" }}>
              Your cart awaits brilliance.
            </p>
            <Link href="/collections">
              <button
                type="button"
                style={{
                  padding: "12px 32px",
                  borderRadius: 999,
                  background: "#046307",
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 18px rgba(4,99,7,0.25)",
                  transition: "opacity 0.2s",
                }}
              >
                Explore Collections
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Items list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>

            {/* Gold divider */}
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", marginBottom: 28 }} />

            {/* Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360, marginLeft: "auto", marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#555" }}>
                <span>Subtotal ({count} item{count !== 1 ? "s" : ""})</span>
                <span style={{ fontWeight: 600, color: "#111" }}>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#aaa" }}>
                <span>Taxes (est. 3%)</span>
                <span>₹{tax.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>
              <div style={{ height: 1, background: "rgba(212,175,55,0.3)", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 700, color: "#111" }}>
                <span style={{ fontFamily: "var(--font-brand), Georgia, serif", letterSpacing: "0.06em" }}>Grand Total</span>
                <span style={{ fontFamily: "var(--font-brand), Georgia, serif" }}>₹{(total + tax).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "flex-end", alignItems: "center" }}>
              <button
                type="button"
                onClick={clearCart}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", color: "#bbb", letterSpacing: "0.14em", textTransform: "uppercase", padding: "8px 0" }}
              >
                Clear Cart
              </button>

              <Link href="/collections">
                <button
                  type="button"
                  style={{
                    padding: "12px 28px",
                    borderRadius: 999,
                    background: "#046307",
                    color: "#fff",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(4,99,7,0.22)",
                  }}
                >
                  Continue Shopping
                </button>
              </Link>

              <Link href="/checkout">
                <button
                  type="button"
                  style={{
                    padding: "12px 32px",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #c9a227 0%, #f0d060 45%, #d4af37 60%, #a8841c 100%)",
                    color: "#1a1200",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    border: "1px solid rgba(255,220,80,0.5)",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(212,175,55,0.35)",
                  }}
                >
                  Checkout All
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
