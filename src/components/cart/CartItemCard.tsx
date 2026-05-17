"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { CartItem } from "@/data/types";
import { useCart } from "@/context/CartContext";
import { getProductImage } from "@/utils/productImageHelper";
import { BestsellerBadge } from "@/components/ui/BestsellerBadge";

export function CartItemCard({ item }: { item: CartItem }) {
  const { removeFromCart, updateQuantity } = useCart();
  const [hovered, setHovered] = useState(false);

  const handleMinus = () => {
    if (item.quantity === 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.22 } }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: 16,
        padding: "18px 20px",
        background: "#FDFAF4",
        border: "1px solid rgba(212,175,55,0.25)",
        borderRadius: 18,
        boxShadow: hovered
          ? "0 8px 28px rgba(0,0,0,0.11), 0 0 0 1px rgba(212,175,55,0.18)"
          : "0 4px 18px rgba(0,0,0,0.06)",
        alignItems: "center",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
    >
      {/* Image + badge above it */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5, flexShrink: 0 }}>
        {item.bestseller && <BestsellerBadge variant="inline" />}
        <div
          style={{
            position: "relative",
            width: 88,
            height: 88,
            borderRadius: 12,
            overflow: "hidden",
            border: "1.5px solid #D4AF37",
            boxShadow: "0 0 10px rgba(212,175,55,0.2)",
          }}
        >
          <SafeImage src={getProductImage(item)} alt={item.title} fill className="object-cover" sizes="88px" />
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-brand), Georgia, serif", fontSize: "0.92rem", fontWeight: 600, color: "#111", marginBottom: 2, letterSpacing: "0.04em" }}>
          {item.title}
        </p>
        {item.category && (
          <p style={{ fontSize: "0.72rem", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>{item.category}</p>
        )}
        {item.variant ? (
          <p style={{ fontSize: "0.72rem", color: "#aaa", marginBottom: 2 }}>{item.variant}</p>
        ) : (
          item.purity && (
            <p style={{ fontSize: "0.72rem", color: "#999" }}>{item.purity}</p>
          )
        )}
      </div>

      {/* Right: qty + price + remove */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
        <p style={{ fontFamily: "var(--font-brand), Georgia, serif", fontSize: "0.9rem", fontWeight: 600, color: "#111" }}>
          {item.price}
        </p>

        {/* Quantity */}
        <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 999, overflow: "hidden" }}>
          <button
            type="button"
            onClick={handleMinus}
            style={{ width: 28, height: 28, background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Decrease quantity"
          >−</button>
          <span style={{ minWidth: 24, textAlign: "center", fontSize: "0.82rem", fontWeight: 600, color: "#111" }}>{item.quantity}</span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            style={{ width: 28, height: 28, background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Increase quantity"
          >+</button>
        </div>

        <button
          type="button"
          onClick={() => removeFromCart(item.id)}
          style={{ fontSize: "0.68rem", color: "#bbb", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", padding: 0 }}
        >
          Remove
        </button>
      </div>
    </motion.div>
  );
}
