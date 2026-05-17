"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/home/Navbar";
import { ProductGrid } from "@/components/shared/ProductGrid";
import { rings } from "@/data/rings";

type HeroPhase = "center" | "settled";

export function RingsPage() {
  const [heroPhase, setHeroPhase] = useState<HeroPhase>("center");

  // Lock scroll during intro animation
  useEffect(() => {
    const locked = heroPhase !== "settled";
    document.body.style.overflow = locked ? "hidden" : "auto";
    document.body.style.touchAction = locked ? "none" : "auto";
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "auto";
    };
  }, [heroPhase]);

  // Auto-settle hero after animation
  useEffect(() => {
    const t = window.setTimeout(() => setHeroPhase("settled"), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const settled = heroPhase === "settled";

  return (
    <main className="min-h-screen bg-white">
      <Navbar phase={settled ? "always" : "loader"} active="collections" fixed={false} />

      {/* Hero section with fade-in animation */}
      <motion.section
        className="relative w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: settled ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Hero background */}
        <div
          className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.5), rgba(20,20,20,0.7)), url('/products/ring-hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Content overlay */}
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: settled ? 1 : 0, y: settled ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-brand uppercase tracking-[0.15em] mb-3 sm:mb-4"
              style={{ color: "#D4AF37" }}
            >
              Rings Collection
            </h1>
            <p
              className="text-lg sm:text-xl font-ui tracking-wider"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Crafted for timeless elegance
            </p>
          </motion.div>

          {/* Decorative line */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
              boxShadow: "0 0 20px rgba(212,175,55,0.5)",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: settled ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.section>

      {/* Product grid section */}
      <motion.section
        className="w-full flex justify-center px-3 sm:px-4 py-12 sm:py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: settled ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeInOut" }}
      >
        <div className="w-[min(1180px,calc(100vw-1.5rem))]">
          <ProductGrid products={rings} />

          {/* Bottom section spacing */}
          <div className="mt-12 sm:mt-16" />
        </div>
      </motion.section>
    </main>
  );
}
