"use client";

import { motion } from "framer-motion";
import { ProductFlipCard } from "./ProductFlipCard";

type CardData = {
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
};

type GlassCardProps = {
  cards: CardData[];
  delay?: number;
};

export function GlassCard({ cards, delay = 0 }: GlassCardProps) {
  return (
    <div className="flex justify-center px-3 sm:px-4">
      <motion.div
        className="relative w-[min(1180px,calc(100vw-1.5rem))] overflow-hidden rounded-[24px] border border-white/[0.08] p-8 sm:p-10"
        style={{
          background: "rgba(0,0,0,0.40)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.22)",
        }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Subtle inner top gradient */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[24px]"
          style={{
            background:
              "linear-gradient(180deg,rgba(0,0,0,0.15) 0%,transparent 35%)",
          }}
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:gap-7 md:gap-8">
          {cards.map((card) => (
            <ProductFlipCard key={card.title} {...card} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
