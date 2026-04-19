"use client";

import { motion } from "framer-motion";
import { DiamondMark } from "@/components/home/DiamondMark";

type CollectionsHeroProps = {
  /** "center" = full-screen stage, "settled" = morphed into heading position */
  phase: "center" | "settled";
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function CollectionsHero({ phase }: CollectionsHeroProps) {
  const settled = phase === "settled";

  return (
    <>
      {/* ── Full-screen overlay (only during center phase) ── */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 bg-white"
        initial={{ opacity: 1 }}
        animate={{ opacity: settled ? 0 : 1 }}
        transition={{ duration: 0.55, delay: settled ? 0.45 : 0, ease: "easeInOut" }}
        style={{ pointerEvents: "none" }}
      />

      {/* ── Animated block: center → heading ── */}
      <motion.div
        className="pointer-events-none fixed z-35 flex flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, scale: 0.92, x: "-50%", y: "-50%", top: "50%", left: "50%" }}
        animate={
          settled
            ? {
                // morph: shrink + fly up to just below navbar
                opacity: 0,
                scale: 0.72,
                top: "50%",
                left: "50%",
                x: "-50%",
                y: "-50%",
              }
            : {
                opacity: 1,
                scale: 1,
                top: "50%",
                left: "50%",
                x: "-50%",
                y: "-50%",
              }
        }
        transition={{ duration: settled ? 0.55 : 0.75, ease: EASE }}
        aria-hidden="true"
      >
        <DiamondMark size={52} />
        <h1
          className="font-ui font-semibold uppercase"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
            letterSpacing: "0.18em",
            color: "#046307",
            textShadow: "0 0 40px rgba(4,99,7,0.18)",
          }}
        >
          Our Collections
        </h1>
      </motion.div>
    </>
  );
}
