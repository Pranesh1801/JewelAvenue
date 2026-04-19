"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ProductCard } from "./ProductCard";

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const RingIcon = () => (
  <img
    src="/Ring_Collections.jpeg"
    alt="Rings"
    className="absolute inset-0 h-full w-full object-cover object-center"
  />
);

const EarringsIcon = () => (
  <svg viewBox="0 0 120 120" className="h-[62%] w-[62%]" fill="none">
    <line x1="38" y1="18" x2="38" y2="38" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="38" cy="58" rx="14" ry="20" stroke="#D4AF37" strokeWidth="3" />
    <circle cx="38" cy="58" r="6" fill="#D4AF37" opacity="0.35" />
    <line x1="82" y1="18" x2="82" y2="38" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="82" cy="58" rx="14" ry="20" stroke="#D4AF37" strokeWidth="3" />
    <circle cx="82" cy="58" r="6" fill="#D4AF37" opacity="0.35" />
  </svg>
);

const BraceletIcon = () => (
  <img
    src="/Bracelet_Collections.jpeg"
    alt="Bracelets"
    className="absolute inset-0 h-full w-full object-cover"
    style={{ objectPosition: "50% 45%" }}
  />
);

const NecklaceIcon = () => (
  <img
    src="/Jhumkas_Collections.jpeg"
    alt="Jhumkas"
    className="absolute inset-0 h-full w-full object-cover object-center"
  />
);

const BanglesIcon = () => (
  <img
    src="/Bangles_Collections.jpeg"
    alt="Bangles"
    className="absolute inset-0 h-full w-full object-cover object-center"
  />
);

const PendantIcon = () => (
  <img
    src="/Pendant_Collections.jpeg"
    alt="Pendants"
    className="absolute inset-0 h-full w-full object-cover object-center scale-133"
  />
);

const BarIcon = () => (
  <svg viewBox="0 0 120 120" className="h-[62%] w-[62%]" fill="none">
    <rect x="22" y="38" width="76" height="44" rx="6" stroke="#D4AF37" strokeWidth="3" />
    <rect x="30" y="46" width="60" height="28" rx="4" stroke="#D4AF37" strokeWidth="1.5" opacity="0.45" />
    <line x1="38" y1="60" x2="82" y2="60" stroke="#D4AF37" strokeWidth="1.5" opacity="0.5" strokeDasharray="5 3" />
    <text x="60" y="65" textAnchor="middle" fontSize="9" fill="#D4AF37" opacity="0.8" fontFamily="serif" letterSpacing="1">999.9</text>
  </svg>
);

// ── Data ──────────────────────────────────────────────────────────────────────

const row1 = [
  { title: "Rings",     tagline: "Crafted for timeless elegance",       icon: <RingIcon /> },
  { title: "Earrings",  tagline: "Delicate brilliance in every detail",  icon: <EarringsIcon /> },
  { title: "Bracelets", tagline: "Refined beauty for every moment",      icon: <BraceletIcon /> },
];

const row2 = [
  { title: "Jhumkas",  tagline: "Traditional elegance, reimagined",      icon: <NecklaceIcon /> },
  { title: "Pendants", tagline: "Meaning in every detail",               icon: <PendantIcon /> },
  { title: "Bangles",  tagline: "Grace in every movement",               icon: <BanglesIcon /> },
];

const row3 = [
  { title: "Gold & Silver Bars", tagline: "Luxury you can hold", icon: <BarIcon /> },
];

// ── Spotlight wrapper — radial gold glow behind each card ─────────────────────

function CardSpotlight({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      className="relative flex-1"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Radial spotlight behind card */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-[18px]"
        style={{
          background: "radial-gradient(circle at center, rgba(212,175,55,0.08), transparent 70%)",
          filter: "blur(12px)",
          transform: "scale(1.15)",
        }}
      />
      {children}
    </motion.div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

type HeroGlassCardProps = {
  solid?: boolean;
  entryDelay?: number;
};

export function HeroGlassCard({ solid = false, entryDelay = 0 }: HeroGlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Subtle parallax — max 20px upward drift
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -20]);

  const cardStyle = solid
    ? {
        background: "#000000",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 12px 48px rgba(0,0,0,0.55)",
      }
    : {
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        // Outer shadow + inset depth shadow
        boxShadow: "0 10px 40px rgba(0,0,0,0.28), inset 0 0 40px rgba(0,0,0,0.30)",
      };

  return (
    <div ref={ref} className="relative flex justify-center px-3 sm:px-4">
      <motion.section
        className="relative w-[min(1180px,calc(100vw-1.5rem))] overflow-hidden rounded-[24px] p-6 sm:p-8 md:p-10"
        style={{ ...cardStyle, y }}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: entryDelay, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Layered depth gradient — top dark, fades to mid */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[24px]"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.45))" }}
        />

        {/* Very faint grain texture for surface realism */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[24px] opacity-[0.03]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "128px",
          }}
        />

        <div className="relative flex flex-col items-center gap-10 sm:gap-12">
          {/* Row 1 — staggered entry per card */}
          <div className="flex w-full flex-col gap-7 sm:flex-row sm:gap-8 md:gap-9">
            {row1.map((p, i) => (
              <CardSpotlight key={p.title} delay={entryDelay + 0.15 + i * 0.1}>
                <ProductCard {...p} />
              </CardSpotlight>
            ))}
          </div>

          {/* Row 2 — staggered entry per card */}
          <div className="flex w-full flex-col gap-7 sm:flex-row sm:gap-8 md:gap-9">
            {row2.map((p, i) => (
              <CardSpotlight key={p.title} delay={entryDelay + 0.35 + i * 0.1}>
                <ProductCard {...p} />
              </CardSpotlight>
            ))}
          </div>

          {/* Row 3 — single centered card, same width as one column */}
          <div className="flex w-full justify-center">
            <div className="w-full sm:w-[calc(33.333%-1.5rem)]">
              <CardSpotlight delay={entryDelay + 0.55}>
                <ProductCard {...row3[0]} />
              </CardSpotlight>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
