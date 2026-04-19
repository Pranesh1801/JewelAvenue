"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function ContactSection() {
  return (
    <section id="contact" className="bg-[#f7f7f5] px-4 py-24 sm:py-32">
      <motion.div
        className="mx-auto flex max-w-xl flex-col items-center gap-10 text-center"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Heading */}
        <div className="flex flex-col items-center gap-3">
          <h2
            className="font-ui text-4xl font-semibold uppercase tracking-[0.14em] sm:text-5xl"
            style={{ color: "#D4AF37" }}
          >
            Get In Touch
          </h2>
          <p className="font-ui text-[0.9rem] text-black/55">
            We&apos;re here to help you find the perfect piece.
          </p>
        </div>

        {/* Contact card */}
        <div
          className="w-full rounded-[20px] px-8 py-10"
          style={{
            background: "rgba(0,0,0,0.03)",
            border: "1px solid rgba(212,175,55,0.18)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex flex-col gap-6">
            {[
              { label: "Email", value: "ajay.krishna@jewelavenue.in", href: "mailto:contact@jewelavenue.com" },
              { label: "Phone", value: "+91 8884878033", href: "tel:+918884878033" },
              { label: "Location", value: "Bengaluru, India", href: null },
            ].map(({ label, value, href }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span
                  className="font-ui text-[0.65rem] uppercase tracking-[0.28em]"
                  style={{ color: "#D4AF37" }}
                >
                  {label}
                </span>
                {href ? (
                  <a
                    href={href}
                    className="font-ui text-[0.95rem] text-black/75 transition-colors duration-200 hover:text-black"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="font-ui text-[0.95rem] text-black/75">{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/collections"
          className="group relative overflow-hidden rounded-full px-8 py-3 font-ui text-[0.78rem] uppercase tracking-[0.28em] text-white transition-all duration-300"
          style={{ background: "#046307" }}
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ boxShadow: "0 0 18px rgba(212,175,55,0.5)", background: "rgba(212,175,55,0.08)" }}
          />
          Explore Collections
        </Link>
      </motion.div>
    </section>
  );
}
