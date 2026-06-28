"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function GiftingCard() {
  const [settings, setSettings] = useState({
    giftingTitle: "Unforgettable Gifting",
    giftingTagline: "Wrap your love in our iconic green boxes.",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setSettings({
            giftingTitle: data.giftingTitle || "Unforgettable Gifting",
            giftingTagline: data.giftingTagline || "Wrap your love in our iconic green boxes.",
          });
        }
      })
      .catch(err => console.error("Error fetching gifting settings:", err));
  }, []);

  return (
    <section className="flex justify-center px-3 sm:px-4 mt-12 mb-12">
      <div
        className="w-[min(1180px,calc(100vw-1.5rem))] rounded-[22px] overflow-hidden relative group"
        style={{
          height: "clamp(300px, 45vh, 480px)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
        }}
      >
        {/* Beautiful premium background image */}
        <img
          src="/Bracelet_Collections.jpeg"
          alt="Gifting"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          style={{ objectPosition: "50% 30%" }}
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          }}
        />

        {/* Elegant typography details overlay */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12 md:px-16 text-white max-w-lg z-10 space-y-4">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 0.75, y: 0 }}
            viewport={{ once: true }}
            className="text-[0.62rem] font-ui uppercase tracking-[0.3em] text-[#D4AF37]"
          >
            ✦ Signature Packaging
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-brand text-[1.6rem] sm:text-[2.2rem] leading-tight font-medium"
          >
            {settings.giftingTitle}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.7, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[0.8rem] tracking-wider leading-relaxed text-white/80"
          >
            {settings.giftingTagline}
          </motion.p>
        </div>

        {/* Premium thin gold border line */}
        <div className="absolute inset-4 rounded-[18px] border border-[#D4AF37]/20 pointer-events-none" />
      </div>
    </section>
  );
}