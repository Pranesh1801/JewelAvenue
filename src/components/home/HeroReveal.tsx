"use client";

import { DiamondMark } from "./DiamondMark";

const jewelLetters = ["J", "E", "W", "E", "L"];
const avenueLetters = ["A", "V", "E", "N", "U", "E"];

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

type HeroRevealProps = {
  phase: "loader" | "hero" | "morph" | "nav" | "complete";
  typedCount: number;
  showAvenue: boolean;
  isMobile: boolean;
};

export function HeroReveal({
  phase,
  typedCount,
  showAvenue,
  isMobile,
}: HeroRevealProps) {
  // ── Phase booleans ─────────────────────────────────────────────────────────
  const isRearranging = phase === "morph" || phase === "nav" || phase === "complete";
  const isMoving      = phase === "nav"   || phase === "complete";
  const isDone        = phase === "complete";

  // ── PHASE 2: positional move — wrapper flies to navbar corner ──────────────
  // Only activates once rearrange is already done
  const wrapperX = isMoving ? (isMobile ? "33vw"  : "35vw")  : "0vw";
  const wrapperY = isMoving ? (isMobile ? "-34vh" : "-36vh") : "0vh";

  // ── PHASE 1: in-place rearrange values ────────────────────────────────────

  // Logo shrinks to navbar size during rearrange
  const logoSize = isRearranging ? 18 : (isMobile ? 52 : 68);

  // Text block: translates up + right to sit beside the logo
  const textX = isRearranging ? (isMobile ? "1.4rem" : "1.6rem") : "0rem";
  const textY = isRearranging ? (isMobile ? "-2.6rem" : "-3.2rem") : "0rem";

  // JEWEL: shrinks font + tightens tracking to navbar brand size
  const jewelSize     = isRearranging ? "0.78rem" : "clamp(3rem, 8vw, 6.8rem)";
  const jewelTracking = isRearranging ? "0.34em"  : "0em";
  const jewelLeading  = isRearranging ? "1"       : "0.9";
  const jewelColor    = isRearranging ? "white"   : "black";

  // AVENUE: lifts up to baseline-align with JEWEL, shifts right past it
  const avenueSize     = isRearranging ? "0.78rem"                        : "clamp(0.9rem, 1.6vw, 1.12rem)";
  const avenueTracking = isRearranging ? "0.34em"                         : "0.52em";
  const avenueX        = isRearranging ? (isMobile ? "3.8rem" : "4.4rem") : "0rem";
  const avenueY        = isRearranging ? (isMobile ? "-2.1rem" : "-2.6rem") : "0rem";
  const avenueColor    = isRearranging ? "rgba(255,255,255,0.78)"          : "rgba(0,0,0,0.78)";

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-1/2 z-30 flex flex-col items-center text-center"
      style={{
        // PHASE 2 — positional move, only after rearrange is done
        opacity: isDone ? 0 : 1,
        transform: `translate(calc(-50% + ${wrapperX}), calc(-50% + ${wrapperY}))`,
        transition: `transform 900ms ${EASE}, opacity 350ms ease-in`,
      }}
      aria-hidden="true"
    >
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      {/* Stays in column-top position; text block translates up to meet it */}
      <div
        style={{
          opacity: phase === "loader" ? 0 : 1,
          transform: phase === "loader" ? "scale(0.82)" : "scale(1)",
          // PHASE 1: size shrink
          width:  `${logoSize}px`,
          height: `${logoSize}px`,
          transition: [
            `width 600ms ${EASE}`,
            `height 600ms ${EASE}`,
            `opacity 700ms ${EASE}`,
            `transform 700ms ${EASE}`,
          ].join(", "),
          flexShrink: 0,
          overflow: "visible",
        }}
      >
        <DiamondMark
          size={logoSize}
          className={phase === "hero" ? "animate-jewel-loader-pulse" : ""}
        />
      </div>

      {/* ── Text block (JEWEL + AVENUE) ────────────────────────────────────── */}
      {/* PHASE 1: translates up-right to sit inline beside logo */}
      <div
        className={`flex flex-col items-center ${phase === "hero" ? "animate-jewel-word-rise" : ""}`}
        style={{
          transform: `translate(${textX}, ${textY})`,
          transition: `transform 620ms ${EASE}`,
        }}
      >
        {/* JEWEL */}
        <div
          className="font-brand"
          style={{
            fontSize:      jewelSize,
            letterSpacing: jewelTracking,
            lineHeight:    jewelLeading,
            color:         jewelColor,
            transition: [
              `font-size 600ms ${EASE}`,
              `letter-spacing 600ms ${EASE}`,
              `line-height 600ms ${EASE}`,
              `color 400ms ease`,
            ].join(", "),
          }}
        >
          <span className="inline-flex">
            {jewelLetters.map((letter, i) => {
              const visible = typedCount > i;
              return (
                <span
                  key={`j-${i}`}
                  className="inline-block"
                  style={{
                    opacity:   visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(1rem)",
                    filter:    visible ? "blur(0)"       : "blur(4px)",
                    transition: `opacity 700ms ${EASE}, transform 700ms ${EASE}, filter 700ms ${EASE}`,
                    transitionDelay: `${i * 95}ms`,
                  }}
                >
                  {letter}
                </span>
              );
            })}
          </span>
        </div>

        {/* AVENUE */}
        {/* PHASE 1: lifts up and shifts right to sit on same baseline as JEWEL */}
        <div
          className="font-ui uppercase"
          style={{
            fontSize:      avenueSize,
            letterSpacing: avenueTracking,
            color:         avenueColor,
            transform:     `translate(${avenueX}, ${avenueY})`,
            marginTop:     "0.75rem",
            transition: [
              `font-size 600ms ${EASE}`,
              `letter-spacing 600ms ${EASE}`,
              `transform 640ms ${EASE}`,
              `color 400ms ease`,
            ].join(", "),
            transitionDelay: "60ms",
          }}
        >
          <span className="inline-flex justify-center gap-0.5">
            {avenueLetters.map((letter, i) => (
              <span
                key={`a-${i}`}
                className={`inline-block ${showAvenue ? "animate-jewel-letter-rise" : ""}`}
                style={{
                  opacity:        showAvenue ? 1 : 0,
                  animationDelay: `${110 + i * 72}ms`,
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
