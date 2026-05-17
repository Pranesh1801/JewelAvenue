"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Product } from "../../data/types";
import { useCart } from "@/context/CartContext";
import { BestsellerBadge } from "@/components/ui/BestsellerBadge";

type ProductModalProps = {
  product: Product;
  onClose: () => void;
};

// Check if a spec value is meaningful (not empty, null, "0", "N/A", etc.)
function hasValue(val: string | number | null | undefined): boolean {
  if (val === null || val === undefined) return false;
  const s = String(val).trim();
  if (s === "" || s === "-" || s.toLowerCase() === "n/a" || s.toLowerCase() === "none") return false;
  
  // Clean string to check numeric value (e.g. "0 g", "0.00 ct")
  const numericOnly = s.replace(/[^\d.]/g, "");
  if (numericOnly !== "") {
    const num = parseFloat(numericOnly);
    if (num === 0) return false;
  }
  
  return s !== "0";
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const [isCustomizationExpanded, setIsCustomizationExpanded] = useState(false);
  const [selectedMetal, setSelectedMetal] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedFinish, setSelectedFinish] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [showToast, setShowToast] = useState(false);
  const [toastLeaving, setToastLeaving] = useState(false);
  const [flyStyle, setFlyStyle] = useState<React.CSSProperties | null>(null);

  const { addToCart, cartIconRef } = useCart();
  const images = product.carousel && product.carousel.length > 0 ? product.carousel : [product.image];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft" && hasMultipleImages) handlePrevImage();
      else if (event.key === "ArrowRight" && hasMultipleImages) handleNextImage();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose, hasMultipleImages, images.length]);

  useEffect(() => {
    if (!hasMultipleImages) return;
    const interval = setInterval(handleNextImage, 5000);
    return () => clearInterval(interval);
  }, [hasMultipleImages, images.length]);

  const handlePrevImage = () => {
    setSlideDirection("left");
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setSlideDirection("right");
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleAddToCart = () => {
    // Fly animation
    if (imageRef.current && cartIconRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const cartRect = cartIconRef.current.getBoundingClientRect();
      const size = Math.min(imgRect.width, imgRect.height, 80);

      setFlyStyle({
        top: imgRect.top + imgRect.height / 2 - size / 2,
        left: imgRect.left + imgRect.width / 2 - size / 2,
        width: size,
        height: size,
        "--fly-tx": `${cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2)}px`,
        "--fly-ty": `${cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2)}px`,
      } as React.CSSProperties);

      setTimeout(() => setFlyStyle(null), 750);
    }

    const hasCustomization = !!(selectedMetal || selectedSize || selectedFinish);

    addToCart({
      productId: product.id,
      title: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      // Use selected metal as purity if the user picked one, otherwise fall back to product default
      purity: selectedMetal || product.purity,
      variant: hasCustomization
        ? [
            selectedMetal || product.purity,
            selectedSize ? `Size ${selectedSize}` : "",
            selectedFinish,
          ].filter(Boolean).join(" · ")
        : undefined,
      bestseller: product.bestseller,
    });

    setShowToast(true);
    setToastLeaving(false);
    setTimeout(() => {
      setToastLeaving(true);
      setTimeout(() => setShowToast(false), 300);
    }, 2000);
  };

  return (
    <>
      {/* Fly clone */}
      {flyStyle && (
        <div
          className="cart-fly-clone"
          style={{
            ...flyStyle,
            backgroundImage: `url(${product.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: "2px solid #D4AF37",
            animationDuration: "0.72s",
          }}
        />
      )}

      {/* Toast */}
      {showToast && (
        <div
          className={toastLeaving ? "toast-out" : "toast-in"}
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "rgba(10,10,10,0.92)",
            border: "1px solid #D4AF37",
            borderRadius: 14,
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(212,175,55,0.15)",
            backdropFilter: "blur(12px)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#D4AF37", fontSize: "1rem" }}>✦</span>
          <span style={{ color: "#fff", fontSize: "0.82rem", fontFamily: "var(--font-brand), Georgia, serif", letterSpacing: "0.12em" }}>
            Added to Cart
          </span>
        </div>
      )}

      <motion.div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(10px)" }}
        onMouseDown={(event) => { if (event.target === overlayRef.current) onClose(); }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-[94vw] max-w-[1180px] max-h-[92vh] sm:w-[78vw] sm:max-h-[88vh] overflow-hidden rounded-[28px] border border-[#D4AF37]/20 bg-[#FBF5EE] shadow-[0_30px_90px_rgba(0,0,0,0.18)]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/80 text-black transition duration-200 ease-out hover:text-[#D4AF37] hover:shadow-[0_0_18px_rgba(212,175,55,0.2)] hover:scale-105 focus:outline-none"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Mobile Layout */}
          <div className="flex flex-col max-h-[92vh] overflow-y-auto lg:hidden">
            {/* Mobile Image Section */}
            <div className="w-full h-[52vh] min-h-[280px] flex-shrink-0 flex items-center justify-center p-4 relative overflow-hidden rounded-t-[28px]">
              <div ref={imageRef} className="relative w-full max-w-[540px] aspect-square p-[10px] border-2 border-black rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.10)]">
                {product.bestseller && (
                  <div style={{ position: "absolute", top: 18, left: 18, zIndex: 20 }}>
                    <BestsellerBadge />
                  </div>
                )}
                <div className="w-full h-full border-[1.5px] border-[#D4AF37] rounded-[22px] overflow-hidden relative">
                  <AnimatePresence initial={false} custom={slideDirection}>
                    <motion.div
                      key={currentImageIndex}
                      custom={slideDirection}
                      initial={{ opacity: 0, x: slideDirection === "right" ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: slideDirection === "right" ? -50 : 50 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <img
                        src={images[currentImageIndex]}
                        alt={`${product.name} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full transition duration-200 ease-out hover:scale-110"
                      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "18px" }}
                      aria-label="Previous image"
                    >‹</button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full transition duration-200 ease-out hover:scale-110"
                      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "18px" }}
                      aria-label="Next image"
                    >›</button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Details Section */}
            <div className="flex flex-col w-full p-4 sm:p-6">
              <div className="w-full max-w-xl space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-ui uppercase tracking-[0.25em] text-gray-500">{product.subtitle}</p>
                  <h2 className="text-3xl font-brand uppercase tracking-[0.18em] text-black">{product.name}</h2>
                  <p className="text-lg font-ui text-gray-700">{product.price}</p>
                </div>

                <p className="text-sm leading-6 text-gray-600">{product.description}</p>

                {/* Specs — only render fields that have meaningful values */}
                {(() => {
                  const customSpecs = (product.customAttributes as { label: string; value: string }[]) || [];
                  const specs = [
                    { label: "Style Code", value: product.styleCode },
                    { label: "Purity", value: product.purity },
                    { label: "Gold Weight", value: product.goldWeight },
                    { label: "Net Weight", value: product.netWeight },
                    { label: "Diamond Count", value: product.diamondCount },
                    { label: "Diamond Weight", value: product.diamondWeight },
                    ...customSpecs
                  ].filter(s => hasValue(s.value));
                  if (specs.length === 0) return null;
                  return (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                      {specs.map(s => (
                        <div key={s.label}><p className="font-semibold">{s.label}</p><p>{s.value}</p></div>
                      ))}
                    </div>
                  );
                })()}

                {/* Customization — only show if at least one option array has entries */}
                {(() => {
                  const c = product.customizations;
                  if (!c) return null;
                  const validMetals = (c.metal || []).map(m => String(m).trim()).filter(m => m !== "" && m !== "0" && m.toLowerCase() !== "n/a" && m !== "-" && m !== "none");
                  const validSizes = (c.size || []).map(s => String(s).trim()).filter(s => s !== "" && s !== "0" && s.toLowerCase() !== "n/a" && s !== "-" && s !== "none");
                  const validFinishes = (c.finish || []).map(f => String(f).trim()).filter(f => f !== "" && f !== "0" && f.toLowerCase() !== "n/a" && f !== "-" && f !== "none");

                  const hasMetal = validMetals.length > 0;
                  const hasSize = validSizes.length > 0;
                  const hasFinish = validFinishes.length > 0;
                  if (!hasMetal && !hasSize && !hasFinish) return null;
                  return (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setIsCustomizationExpanded(!isCustomizationExpanded)}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white/80 hover:bg-white hover:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition duration-300"
                      >
                        <span className="text-sm font-semibold text-black">✦ Customize Your Piece</span>
                        <motion.span className="text-[#D4AF37] text-lg" animate={{ rotate: isCustomizationExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>▼</motion.span>
                      </button>

                      <motion.div
                        initial={false}
                        animate={{ height: isCustomizationExpanded ? "auto" : 0, opacity: isCustomizationExpanded ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 p-4 bg-white/60 rounded-lg">
                          {hasMetal && (
                            <div>
                              <p className="text-sm font-semibold text-gray-800 mb-2">Metal Type</p>
                              <div className="flex flex-wrap gap-2">
                                {validMetals.map((metal) => (
                                  <button key={metal} type="button" onClick={() => setSelectedMetal(metal)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition duration-200 ${selectedMetal === metal ? "bg-black text-[#D4AF37]" : "bg-white border border-gray-300 text-black hover:border-[#D4AF37]"}`}>
                                    {metal}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {hasSize && (
                            <div>
                              <p className="text-sm font-semibold text-gray-800 mb-2">Size</p>
                              <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50">
                                <option value="">Select Size</option>
                                {validSizes.map((size) => <option key={size} value={size}>{size}</option>)}
                              </select>
                            </div>
                          )}
                          {hasFinish && (
                            <div>
                              <p className="text-sm font-semibold text-gray-800 mb-2">Finish</p>
                              <div className="flex flex-wrap gap-2">
                                {validFinishes.map((finish) => (
                                  <button key={finish} type="button" onClick={() => setSelectedFinish(finish)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition duration-200 ${selectedFinish === finish ? "bg-black text-[#D4AF37]" : "bg-white border border-gray-300 text-black hover:border-[#D4AF37]"}`}>
                                    {finish}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center rounded-full border border-transparent bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition duration-300 ease-out hover:text-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:-translate-y-0.5 sm:w-auto"
                  >
                    Buy Now
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="inline-flex w-full items-center justify-center rounded-full border border-[#D4AF37]/20 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition duration-300 ease-out hover:text-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.18)] hover:-translate-y-0.5 sm:w-auto"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:h-full lg:flex-row lg:items-center lg:gap-0">
            <div className="flex w-full items-center justify-center p-4 sm:p-6 lg:w-[46%] lg:h-full lg:flex lg:items-center lg:justify-center lg:flex-shrink-0">
              <div ref={imageRef} className="relative w-full max-w-[540px] aspect-square p-[10px] border-2 border-black rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.10)]">
                {product.bestseller && (
                  <div style={{ position: "absolute", top: 18, left: 18, zIndex: 20 }}>
                    <BestsellerBadge />
                  </div>
                )}
                <div className="w-full h-full border-[1.5px] border-[#D4AF37] rounded-[22px] overflow-hidden relative">
                  <AnimatePresence initial={false} custom={slideDirection}>
                    <motion.div
                      key={currentImageIndex}
                      custom={slideDirection}
                      initial={{ opacity: 0, x: slideDirection === "right" ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: slideDirection === "right" ? -50 : 50 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <img
                        src={images[currentImageIndex]}
                        alt={`${product.name} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full transition duration-200 ease-out hover:scale-110"
                      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "18px" }}
                      aria-label="Previous image"
                    >‹</button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full transition duration-200 ease-out hover:scale-110"
                      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: "18px" }}
                      aria-label="Next image"
                    >›</button>
                  </>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col p-4 sm:p-6 lg:w-[54%] lg:h-full lg:max-h-[78vh] lg:mt-0 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:flex-none lg:min-h-full lg:overflow-hidden" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="product-modal-scroll-inner">
                <div className="w-full max-w-xl space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm font-ui uppercase tracking-[0.25em] text-gray-500">{product.subtitle}</p>
                    <h2 className="text-3xl font-brand uppercase tracking-[0.18em] text-black">{product.name}</h2>
                    <p className="text-lg font-ui text-gray-700">{product.price}</p>
                  </div>

                  <p className="text-sm leading-6 text-gray-600">{product.description}</p>

                  {/* Specs — only render fields that have meaningful values */}
                  {(() => {
                    const customSpecs = (product.customAttributes as { label: string; value: string }[]) || [];
                    const specs = [
                      { label: "Style Code", value: product.styleCode },
                      { label: "Purity", value: product.purity },
                      { label: "Gold Weight", value: product.goldWeight },
                      { label: "Net Weight", value: product.netWeight },
                      { label: "Diamond Count", value: product.diamondCount },
                      { label: "Diamond Weight", value: product.diamondWeight },
                      ...customSpecs
                    ].filter(s => hasValue(s.value));
                    if (specs.length === 0) return null;
                    return (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                        {specs.map(s => (
                          <div key={s.label}><p className="font-semibold">{s.label}</p><p>{s.value}</p></div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Customization — only show if at least one option array has entries */}
                  {(() => {
                    const c = product.customizations;
                    if (!c) return null;
                    const validMetals = (c.metal || []).map(m => String(m).trim()).filter(m => m !== "" && m !== "0" && m.toLowerCase() !== "n/a" && m !== "-" && m !== "none");
                    const validSizes = (c.size || []).map(s => String(s).trim()).filter(s => s !== "" && s !== "0" && s.toLowerCase() !== "n/a" && s !== "-" && s !== "none");
                    const validFinishes = (c.finish || []).map(f => String(f).trim()).filter(f => f !== "" && f !== "0" && f.toLowerCase() !== "n/a" && f !== "-" && f !== "none");

                    const hasMetal = validMetals.length > 0;
                    const hasSize = validSizes.length > 0;
                    const hasFinish = validFinishes.length > 0;
                    if (!hasMetal && !hasSize && !hasFinish) return null;
                    return (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => setIsCustomizationExpanded(!isCustomizationExpanded)}
                          className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white/80 hover:bg-white hover:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition duration-300"
                        >
                          <span className="text-sm font-semibold text-black">✦ Customize Your Piece</span>
                          <motion.span className="text-[#D4AF37] text-lg" animate={{ rotate: isCustomizationExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>▼</motion.span>
                        </button>

                        <motion.div
                          initial={false}
                          animate={{ height: isCustomizationExpanded ? "auto" : 0, opacity: isCustomizationExpanded ? 1 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 p-4 bg-white/60 rounded-lg">
                            {hasMetal && (
                              <div>
                                <p className="text-sm font-semibold text-gray-800 mb-2">Metal Type</p>
                                <div className="flex flex-wrap gap-2">
                                  {validMetals.map((metal) => (
                                    <button key={metal} type="button" onClick={() => setSelectedMetal(metal)}
                                      className={`px-3 py-1 rounded-full text-xs font-medium transition duration-200 ${selectedMetal === metal ? "bg-black text-[#D4AF37]" : "bg-white border border-gray-300 text-black hover:border-[#D4AF37]"}`}>
                                      {metal}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            {hasSize && (
                              <div>
                                <p className="text-sm font-semibold text-gray-800 mb-2">Size</p>
                                <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50">
                                  <option value="">Select Size</option>
                                  {validSizes.map((size) => <option key={size} value={size}>{size}</option>)}
                                </select>
                              </div>
                            )}
                            {hasFinish && (
                              <div>
                                <p className="text-sm font-semibold text-gray-800 mb-2">Finish</p>
                                <div className="flex flex-wrap gap-2">
                                  {validFinishes.map((finish) => (
                                    <button key={finish} type="button" onClick={() => setSelectedFinish(finish)}
                                      className={`px-3 py-1 rounded-full text-xs font-medium transition duration-200 ${selectedFinish === finish ? "bg-black text-[#D4AF37]" : "bg-white border border-gray-300 text-black hover:border-[#D4AF37]"}`}>
                                      {finish}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })()}

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center rounded-full border border-transparent bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition duration-300 ease-out hover:text-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:-translate-y-0.5 sm:w-auto"
                    >
                      Buy Now
                    </button>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="inline-flex w-full items-center justify-center rounded-full border border-[#D4AF37]/20 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition duration-300 ease-out hover:text-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.18)] hover:-translate-y-0.5 sm:w-auto"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
