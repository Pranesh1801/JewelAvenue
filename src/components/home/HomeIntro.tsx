"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HeroReveal } from "./HeroReveal";
import { Loader } from "./Loader";
import { Navbar } from "./Navbar";

type Phase = "loader" | "hero" | "morph" | "nav" | "complete";

const JEWEL_LENGTH = 5;

export function HomeIntro() {
  const [phase, setPhase] = useState<Phase>("loader");
  const [typedCount, setTypedCount] = useState(0);
  const [showAvenue, setShowAvenue] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateMode = () => setIsMobile(mediaQuery.matches);
    updateMode();
    mediaQuery.addEventListener("change", updateMode);
    return () => mediaQuery.removeEventListener("change", updateMode);
  }, []);

  useEffect(() => {
    if (phase !== "loader") return undefined;
    const t = window.setTimeout(() => setPhase("hero"), isMobile ? 1300 : 1800);
    return () => window.clearTimeout(t);
  }, [isMobile, phase]);

  useEffect(() => {
    if (phase !== "hero") return undefined;

    const step = isMobile ? 80 : 105;
    const avenueDelay = isMobile ? 180 : 240;
    const morphDelay = isMobile ? 500 : 620;

    const typeTimer = window.setInterval(() => {
      setTypedCount((c) => Math.min(c + 1, JEWEL_LENGTH));
    }, step);

    const avenueTimer = window.setTimeout(
      () => setShowAvenue(true),
      step * JEWEL_LENGTH + avenueDelay,
    );

    const morphTimer = window.setTimeout(
      () => setPhase("morph"),
      step * JEWEL_LENGTH + avenueDelay + morphDelay,
    );

    return () => {
      window.clearInterval(typeTimer);
      window.clearTimeout(avenueTimer);
      window.clearTimeout(morphTimer);
    };
  }, [isMobile, phase]);

  useEffect(() => {
    if (phase !== "morph") return undefined;
    const t = window.setTimeout(() => setPhase("nav"), isMobile ? 580 : 680);
    return () => window.clearTimeout(t);
  }, [isMobile, phase]);

  useEffect(() => {
    if (phase !== "nav") return undefined;
    const t = window.setTimeout(() => setPhase("complete"), isMobile ? 560 : 680);
    return () => window.clearTimeout(t);
  }, [isMobile, phase]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-black">
      <Loader visible={phase === "loader"} />
      <Navbar phase={phase as "loader" | "hero" | "nav" | "complete" | "always"} active="home" />

      {/* Navbar height + glow line + 8px gap */}
      <div className="pt-[calc(4.75rem+2px+8px)] sm:pt-[calc(5rem+2px+8px)]">

        {/* Video card — same width alignment as navbar */}
        <motion.div
          className="flex justify-center px-3 sm:px-4"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{
            opacity: phase === "complete" ? 1 : 0,
            y: phase === "complete" ? 0 : 24,
            scale: phase === "complete" ? 1 : 0.97,
          }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="relative w-[min(1180px,calc(100vw-1.5rem))] overflow-hidden rounded-[22px]"
            style={{
              height: "78vh",
              boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
            }}
          >
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src="/HomeIntro.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
            {/* Subtle dark overlay so any future text stays readable */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.28) 100%)",
              }}
            />
          </div>
        </motion.div>

      </div>

      <HeroReveal
        phase={phase}
        typedCount={typedCount}
        showAvenue={showAvenue}
        isMobile={isMobile}
      />
    </main>
  );
}
