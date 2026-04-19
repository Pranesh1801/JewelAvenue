"use client";

import { useState } from "react";

type ProductFlipCardProps = {
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
};

export function ProductFlipCard({
  title,
  tagline,
  description,
  icon,
}: ProductFlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="w-full"
      style={{ perspective: "1000px", minHeight: "340px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.72s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease",
          transform: flipped ? "rotateY(180deg) translateY(-6px) scale(1.03)" : "rotateY(0deg) translateY(0px) scale(1)",
          minHeight: "340px",
        }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 flex flex-col items-center gap-4 rounded-[18px] border border-white/[0.06] bg-black/50 p-5 sm:p-6"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          {/* Image container */}
          <div
            className="flex w-full flex-1 items-center justify-center overflow-hidden rounded-[14px] bg-white"
            style={{
              border: "1.5px solid #D4AF37",
              boxShadow: flipped
                ? "0 0 14px rgba(212,175,55,0.7), 0 0 32px rgba(212,175,55,0.3)"
                : "0 0 8px rgba(212,175,55,0.5), 0 0 20px rgba(212,175,55,0.2)",
              animation: "gold-pulse 3s ease-in-out infinite",
              transition: "box-shadow 0.4s ease",
            }}
          >
            <div
              style={{
                transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
                transform: flipped ? "scale(1.06)" : "scale(1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {icon}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 text-center">
            <h3
              className="font-brand text-lg tracking-[0.12em] sm:text-xl"
              style={{
                color: "#D4AF37",
                transition: "opacity 0.3s ease",
                opacity: flipped ? 1 : 0.9,
              }}
            >
              {title}
            </h3>
            <p
              className="font-ui text-[0.75rem] tracking-wide sm:text-[0.8rem]"
              style={{
                color: "rgba(255,255,255,0.65)",
                transition: "opacity 0.3s ease",
                opacity: flipped ? 1 : 0.75,
              }}
            >
              {tagline}
            </p>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-[18px] border border-white/[0.08] bg-black/72 p-6 text-center sm:p-8"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <h3
            className="font-brand text-xl tracking-[0.1em] sm:text-2xl"
            style={{ color: "#D4AF37" }}
          >
            {title}
          </h3>
          <p className="font-ui text-[0.8rem] leading-relaxed tracking-wide text-white/75 sm:text-[0.88rem]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
