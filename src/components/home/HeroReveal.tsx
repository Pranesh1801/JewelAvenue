"use client";

import { DiamondMark } from "./DiamondMark";

const jewelLetters = ["J", "E", "W", "E", "L"];
const avenueLetters = ["A", "V", "E", "N", "U", "E"];

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

type HeroRevealProps = {
  phase: "loader" | "hero" | "reverse" | "nav" | "complete";
  typedCount: number;
  avenueCount: number;
  isMobile: boolean;
};

export function HeroReveal({
  phase,
  typedCount,
  avenueCount,
  isMobile,
}: HeroRevealProps) {
  const isDone = phase === "complete";
  const logoSize = isMobile ? 52 : 68;

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-1/2 z-30 flex flex-col items-center text-center"
      style={{
        opacity: isDone ? 0 : 1,
        transform: "translate(-50%, -50%)",
        transition: "opacity 300ms ease-in",
      }}
    >
      {/* LOGO (always visible except loader) */}
      <div
        style={{
          opacity: phase === "loader" ? 0 : 1,
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          transition: `opacity 600ms ${EASE}`,
        }}
      >
        <DiamondMark size={logoSize} />
      </div>

      {/* TEXT */}
      <div className="flex flex-col items-center">
        {/* JEWEL */}
        <div
          className="font-brand"
          style={{
            fontSize: "clamp(3rem, 8vw, 6.8rem)",
            lineHeight: "0.9",
            color: "black",
          }}
        >
          {jewelLetters.map((l, i) => {
            const visible = typedCount > i;
            return (
              <span
                key={i}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? "translateY(0)"
                    : "translateY(1rem)",
                  transition: `all 400ms ${EASE}`,
                }}
              >
                {l}
              </span>
            );
          })}
        </div>

        {/* AVENUE */}
        <div
          className="uppercase"
          style={{
            letterSpacing: "0.5em",
            marginTop: "0.6rem",
          }}
        >
          {avenueLetters.map((l, i) => {
            const visible = avenueCount > i;
            return (
              <span
                key={i}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? "translateY(0)"
                    : "translateY(1rem)",
                  transition: `all 300ms ${EASE}`,
                }}
              >
                {l}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
} 