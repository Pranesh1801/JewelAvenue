"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type CategoryCardProps = {
  title: string;
  tagline: string;
  icon: React.ReactNode;
  href?: string;
  delay?: number;
};

export function CategoryCard({ title, tagline, icon, href, delay = 0 }: CategoryCardProps) {
  const [hovered, setHovered] = useState(false);

  const Card = (
    <motion.div
      className="relative flex flex-1 flex-col items-center gap-4 overflow-hidden rounded-[18px] p-6 sm:p-7"
      style={{
        background: "linear-gradient(to bottom, rgba(3,70,5,0.85), rgba(1,45,3,0.95))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "2px solid #CFAF5A",
        boxShadow: "0 12px 30px rgba(0,0,0,0.45), 0 0 25px rgba(212,175,55,0.25), inset 0 0 8px rgba(212,175,55,0.3)",
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gold shimmer sweep on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[18px]"
        style={{
          background: "linear-gradient(120deg, transparent 20%, rgba(212,175,55,0.13) 50%, transparent 80%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: hovered ? "100% 0%" : "-100% 0%" }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />

      {/* Image container — metallic gold border */}
      <div
        className="relative flex w-full items-center justify-center overflow-hidden rounded-[14px]"
        style={{
          border: "2px solid #CFAF5A",
          boxShadow: "0 0 25px rgba(212,175,55,0.25), inset 0 0 8px rgba(212,175,55,0.3)",
          aspectRatio: "1 / 1",
        }}
      >
        {icon}
      </div>

      {/* Text content */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h3
          className="font-ui text-lg font-semibold uppercase tracking-[0.08em] sm:text-xl"
          style={{ color: "#D4AF37" }}
        >
          {title}
        </h3>
        <p
          className="font-ui text-sm leading-relaxed opacity-90 sm:text-base"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          {tagline}
        </p>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {Card}
      </Link>
    );
  }

  return Card;
}