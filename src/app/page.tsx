"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HomeIntro } from "@/components/home/HomeIntro";
import { AboutSection } from "@/components/home/AboutSection";
import { ContactSection } from "@/components/home/ContactSection";

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  // Hash scroll — wait for intro to finish before attempting scroll
  useEffect(() => {
    if (!introComplete) return;
    const hash = window.location.hash;
    if (!hash) return;
    const t = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 120);
    return () => clearTimeout(t);
  }, [introComplete]);

  return (
    <main>
      <HomeIntro onComplete={handleIntroComplete} />

      {/* About and Contact only render + fade in after intro completes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        // Keep in DOM but invisible so scroll targets exist immediately after complete
        style={{ visibility: introComplete ? "visible" : "hidden" }}
      >
        <AboutSection />
        <ContactSection />
      </motion.div>
    </main>
  );
}
