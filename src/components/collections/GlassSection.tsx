"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ProductFlipCard } from "./ProductFlipCard";

type CardData = {
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
};

type GlassSectionProps = {
  cards: CardData[];
  entryDelay?: number;
};

export function GlassSection({ cards, entryDelay = 0 }: GlassSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Very subtle parallax — max 28px upward drift as card scrolls through viewport
  const y = useTransform(scrollYProgress, [0, 1], [0, -28]);

  return (
    <div ref={ref} className="flex justify-center px-3 sm:px-4">
      <motion.div
        className="relative w-[min(1180px,calc(100vw-1.5rem))] overflow-hidden rounded-[24px] border border-white/[0.08] p-8 sm:p-10"
        style={{
          background: "rgba(0,0,0,0.40)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.22)",
          y,
        }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{
          duration: 0.75,
          delay: entryDelay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Inner top gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[24px]"
          style={{
            background: "linear-gradient(180deg,rgba(0,0,0,0.14) 0%,transparent 32%)",
          }}
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:gap-7 md:gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              className="flex-1"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                delay: entryDelay + 0.1 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProductFlipCard {...card} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
