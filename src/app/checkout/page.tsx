"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/home/Navbar";
import { useCart } from "@/context/CartContext";
import SafeImage from "@/components/shared/SafeImage";
import { getProductImage } from "@/utils/productImageHelper";

export default function CheckoutPage() {
  const { items, getTotalPrice, getTotalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const total = getTotalPrice();
  const tax = total * 0.03;
  const count = getTotalItems();

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white">
      <Navbar phase="always" fixed={false} />

      <div className="w-[min(1100px,calc(100vw-2rem))] mx-auto pt-10 pb-20">

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-brand), Georgia, serif",
            fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#0a0a0a",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Checkout
        </motion.h1>
        <div style={{ height: 2, width: 60, margin: "0 auto 36px", background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", borderRadius: 999 }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

          {/* LEFT — Shipping */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ background: "#FDFAF4", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 20, padding: "28px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
          >
            <h2 style={{ fontFamily: "var(--font-brand), Georgia, serif", fontSize: "1rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#111", marginBottom: 22 }}>
              Shipping Details
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Full Name", placeholder: "Your name" },
                { label: "Email", placeholder: "your@email.com" },
                { label: "Phone", placeholder: "+91 XXXXX XXXXX" },
                { label: "Address", placeholder: "Street address" },
                { label: "City", placeholder: "City" },
                { label: "PIN Code", placeholder: "PIN" },
              ].map(({ label, placeholder }) => (
                <div key={label}>
                  <label style={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#888", display: "block", marginBottom: 5 }}>{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(212,175,55,0.3)",
                      background: "#fff",
                      fontSize: "0.85rem",
                      color: "#111",
                      outline: "none",
                      fontFamily: "var(--font-ui), Arial, sans-serif",
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{ background: "#FDFAF4", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 20, padding: "28px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <h2 style={{ fontFamily: "var(--font-brand), Georgia, serif", fontSize: "1rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#111", marginBottom: 20 }}>
                Order Summary
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(212,175,55,0.3)", flexShrink: 0, position: "relative" }}>
                      <SafeImage src={getProductImage(item)} alt={item.title} fill className="object-cover" sizes="52px" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</p>
                      <p style={{ fontSize: "0.7rem", color: "#aaa" }}>Qty: {item.quantity}</p>
                    </div>
                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#111", flexShrink: 0 }}>{item.price}</p>
                  </div>
                ))}
                {count === 0 && (
                  <p style={{ fontSize: "0.82rem", color: "#bbb", textAlign: "center", padding: "12px 0" }}>No items in cart</p>
                )}
              </div>

              <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", marginBottom: 16 }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#666" }}>
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#aaa" }}>
                  <span>Taxes (3%)</span>
                  <span>₹{tax.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 700, color: "#111", marginTop: 4 }}>
                  <span style={{ fontFamily: "var(--font-brand), Georgia, serif" }}>Total</span>
                  <span style={{ fontFamily: "var(--font-brand), Georgia, serif" }}>₹{(total + tax).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* BUY NOW */}
            <button
              type="button"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 999,
                background: "linear-gradient(135deg, #c9a227 0%, #f0d060 45%, #d4af37 60%, #a8841c 100%)",
                color: "#1a1200",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                border: "1px solid rgba(255,220,80,0.5)",
                cursor: "pointer",
                boxShadow: "0 6px 24px rgba(212,175,55,0.4)",
                fontFamily: "var(--font-brand), Georgia, serif",
              }}
            >
              Buy Now
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
