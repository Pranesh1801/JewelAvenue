"use client";

// variant="overlay" → position:absolute top-left inside image (ProductCard, ProductModal)
// variant="inline"  → position:relative, smaller — used above cart thumbnail
// variant="placed"  → no positioning at all — parent div controls placement (BestsellerSlider)
export function BestsellerBadge({ variant = "overlay" }: { variant?: "overlay" | "inline" | "placed" }) {
  const isInline = variant === "inline";
  const isPlaced = variant === "placed";

  return (
    <span
      className="bestseller-badge"
      style={{
        ...(isInline || isPlaced
          ? { position: "relative", display: "inline-flex" }
          : { position: "absolute", top: "10px", left: "10px", zIndex: 10, display: "inline-flex" }),
        alignItems: "center",
        padding: isInline ? "2px 7px" : "3px 10px",
        borderRadius: "20px",
        background: "linear-gradient(135deg, #c9a227 0%, #f0d060 40%, #d4af37 60%, #a8841c 100%)",
        border: "1px solid rgba(255,220,80,0.6)",
        boxShadow: "0 2px 10px rgba(212,175,55,0.45), inset 0 1px 0 rgba(255,255,255,0.3)",
        fontSize: isInline ? "0.5rem" : "0.58rem",
        fontFamily: "var(--font-brand), Georgia, serif",
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "#1a1200",
        overflow: "hidden",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        flexShrink: 0,
      }}
    >
      <span style={{ position: "relative", zIndex: 1 }}>✦ Bestseller</span>
      <span className="badge-shimmer" />
    </span>
  );
}
