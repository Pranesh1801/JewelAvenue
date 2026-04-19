"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/home/Navbar";
import { HeroGlassCard } from "@/components/home/HeroGlassCard";
import { CollectionsHero } from "./CollectionsHero";

type HeroPhase = "center" | "settled";

export function CollectionsPage() {
  const [heroPhase, setHeroPhase] = useState<HeroPhase>("center");

  // Lock scroll during intro animation, restore when settled
  useEffect(() => {
    const locked = heroPhase !== "settled";
    document.body.style.overflow = locked ? "hidden" : "auto";
    document.body.style.touchAction = locked ? "none" : "auto";
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "auto";
    };
  }, [heroPhase]);

  useEffect(() => {
    const t = window.setTimeout(() => setHeroPhase("settled"), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const settled = heroPhase === "settled";

  return (
    <main className="min-h-screen bg-white">
      <Navbar phase={settled ? "always" : "loader"} active="collections" fixed={false} />

      {/* Existing center → morph intro animation — untouched */}
      <CollectionsHero phase={heroPhase} />

      {/* Page content fades in after intro settles */}
      <motion.div
        className=""
        initial={{ opacity: 0 }}
        animate={{ opacity: settled ? 1 : 0 }}
        transition={{ duration: 0.55, delay: 0.3, ease: "easeInOut" }}
      >
        {/* Heading */}
        <motion.div
          className="flex justify-center px-3 pb-4 pt-6 sm:px-4 sm:pb-5 sm:pt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: settled ? 1 : 0, y: settled ? 0 : 16 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="font-ui text-center text-4xl font-semibold uppercase tracking-[0.1em] sm:text-5xl lg:text-6xl"
            style={{ color: "#046307" }}
          >
            Our Collections
          </h1>
        </motion.div>

        {/* Glass card */}
        <div className="mt-2">
          <HeroGlassCard entryDelay={0.5} />
        </div>

        <div className="h-12 sm:h-16" />
      </motion.div>
    </main>
  );
}
