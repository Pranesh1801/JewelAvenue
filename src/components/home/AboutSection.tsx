"use client";

import { motion } from "framer-motion";

export function AboutSection() {
  return (
    <section id="about" className="bg-white px-4 py-24 sm:py-32">
      <motion.div
        className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Heading */}
        <h2
          className="font-ui text-4xl font-semibold uppercase tracking-[0.14em] sm:text-5xl"
          style={{ color: "#046307" }}
        >
          Our Story
        </h2>

        {/* Gold divider */}
        <div
          className="h-px w-24"
          style={{
            background: "linear-gradient(to right, transparent, #D4AF37, transparent)",
          }}
        />

        {/* Subheading */}
        <p
          className="font-brand text-lg tracking-[0.04em] sm:text-xl"
          style={{ color: "#D4AF37" }}
        >
          A legacy of craftsmanship and timeless elegance
        </p>

        {/* Body */}
        <p className="font-ui text-[0.95rem] leading-relaxed text-black/65 sm:text-base">
          At Jewel Avenue, we believe jewellery is more than adornment it is an
          expression of identity, legacy, and timeless beauty. Every piece reflects
          precision, heritage, and modern sophistication.
        </p>
      </motion.div>
    </section>
  );
}
