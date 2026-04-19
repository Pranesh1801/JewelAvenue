"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HeroReveal } from "./HeroReveal";
import { Loader } from "./Loader";
import { Navbar } from "./Navbar";
import { BestsellerSlider } from "./BestsellerSlider";
import { GiftingCard } from "./GiftingCard";

type Phase = "loader" | "hero" | "reverse" | "nav" | "complete";

const JEWEL_LENGTH = 5;
const AVENUE_LENGTH = 6;

export function HomeIntro() {
  const [phase, setPhase] = useState<Phase>("loader");
  const [typedCount, setTypedCount] = useState(0);
  const [avenueCount, setAvenueCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 🔒 LOCK SCROLL DURING INTRO
  useEffect(() => {
    const locked = phase !== "complete";
    document.body.style.overflow = locked ? "hidden" : "auto";
    document.body.style.touchAction = locked ? "none" : "auto";

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "auto";
    };
  }, [phase]);

  // 📱 MOBILE DETECTION
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateMode = () => setIsMobile(mediaQuery.matches);
    updateMode();
    mediaQuery.addEventListener("change", updateMode);
    return () => mediaQuery.removeEventListener("change", updateMode);
  }, []);

  // ⏳ LOADER → HERO
  useEffect(() => {
    if (phase !== "loader") return;
    const t = setTimeout(() => setPhase("hero"), isMobile ? 1300 : 1800);
    return () => clearTimeout(t);
  }, [phase, isMobile]);

  // ✨ FORWARD TYPING
  useEffect(() => {
    if (phase !== "hero") return;

    let jewel = 0;
    let avenue = 0;

    const jewelInt = setInterval(() => {
      jewel++;
      setTypedCount(jewel);
      if (jewel === JEWEL_LENGTH) clearInterval(jewelInt);
    }, isMobile ? 80 : 100);

    const avenueStart = setTimeout(() => {
      const avenueInt = setInterval(() => {
        avenue++;
        setAvenueCount(avenue);
        if (avenue === AVENUE_LENGTH) clearInterval(avenueInt);
      }, 72);
    }, 500);

    const reverseStart = setTimeout(() => {
      setPhase("reverse");
    }, 2000);

    return () => {
      clearInterval(jewelInt);
      clearTimeout(avenueStart);
      clearTimeout(reverseStart);
    };
  }, [phase, isMobile]);

  // 🔄 REVERSE TEXT CLEANLY
  useEffect(() => {
    if (phase !== "reverse") return;

    let avenue = AVENUE_LENGTH;
    let jewel = JEWEL_LENGTH;

    const avenueInt = setInterval(() => {
      avenue--;
      setAvenueCount(avenue);

      if (avenue === 0) {
        clearInterval(avenueInt);

        const jewelInt = setInterval(() => {
          jewel--;
          setTypedCount(jewel);

          if (jewel === 0) {
            clearInterval(jewelInt);

            // 🧠 IMPORTANT: wait AFTER text fully gone
            setTimeout(() => {
              setPhase("nav");
            }, 350);
          }
        }, isMobile ? 80 : 100);
      }
    }, 72);

    return () => clearInterval(avenueInt);
  }, [phase, isMobile]);

  // 🚀 NAV → COMPLETE
  useEffect(() => {
    if (phase !== "nav") return;
    const t = setTimeout(() => setPhase("complete"), 500);
    return () => clearTimeout(t);
  }, [phase]);

  const navbarPhase = useMemo(() => {
    if (phase === "loader") return "loader";
    if (phase === "nav") return "nav";
    if (phase === "complete") return "complete";
    return "hero";
  }, [phase]);

  return (
    <div className="relative bg-white text-black">
      <Loader visible={phase === "loader"} />

      <Navbar phase={navbarPhase} active="home" />

      {/* Navbar spacing wrapper */}
<div className="pt-[calc(4.75rem+2px+8px)] sm:pt-[calc(5rem+2px+8px)]">

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
        height: "clamp(520px, 78vh, 720px)",
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
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.28) 100%)",
        }}
      />
    </div>
  </motion.div>

</div>
      <BestsellerSlider/>
    <GiftingCard />

      {/* HERO REVEAL */}
      <HeroReveal
        phase={phase}
        typedCount={typedCount}
        avenueCount={avenueCount}
        isMobile={isMobile}
      />
    </div>
  );
}