"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type ProductCardProps = {
  title: string;
  tagline: string;
  icon: React.ReactNode;
  href?: string;
};

export function ProductCard({ title, tagline, icon, href }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  const Card = (
    <motion.div
      className="relative flex flex-1 flex-col items-center gap-4 overflow-hidden rounded-[18px] p-6 sm:p-7"
      style={{
        background: "linear-gradient(145deg, #001F1A 0%, #012B24 28%, #01352B 55%, #014235 78%, #001F1A 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "2px solid #CFAF5A",
        boxShadow: "inset 0 0 24px rgba(11,92,71,0.25), 0 8px 18px rgba(0,0,0,0.12)",
      }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
        <div className="flex h-full w-full items-center justify-center rounded-[13px] bg-white">
          {icon}
        </div>
      </div>

      {/* Text */}
      <div className="relative flex flex-col items-center gap-1.5 text-center">
        <h3
          className="font-brand text-lg sm:text-xl"
          style={{
            fontFamily: "'Forum', serif", 
            color: "#D4AF37",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          {title}
        </h3>
        <p
          className="font-ui text-[0.72rem] tracking-wide sm:text-[0.77rem]"
          style={{ color: "rgba(255,255,255,0.80)" }}
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
