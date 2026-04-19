"use client";

import Link from "next/link";
import { useState } from "react";
import { DiamondMark } from "./DiamondMark";

type NavbarProps = {
  phase?: "loader" | "hero" | "nav" | "complete" | "always";
  active?: "home" | "collections" | "about" | "contact";
};

const links: { label: string; href: string; key: NavbarProps["active"] }[] = [
  { label: "Home", href: "/", key: "home" },
  { label: "Collections", href: "/collections", key: "collections" },
  { label: "About", href: "#about", key: "about" },
  { label: "Contact", href: "#contact", key: "contact" },
];

function NavLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="whitespace-nowrap font-ui text-[0.63rem] font-medium uppercase tracking-[0.28em] transition-colors duration-300 sm:text-[0.72rem]"
      style={{
        color: isActive || hovered ? "#D4AF37" : "rgba(255,255,255,0.6)",
        textShadow:
          hovered ? "0 0 8px rgba(212,175,55,0.6)" : "none",
        transition: "color 0.3s ease-in-out, text-shadow 0.3s ease-in-out",
      }}
    >
      {children}
    </Link>
  );
}

export function Navbar({ phase = "always", active }: NavbarProps) {
  const isVisible =
    phase === "always" || phase === "nav" || phase === "complete";
  const glowVisible = phase === "always" || phase === "complete";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-4 sm:px-4 sm:pt-5">
      <div
        className={`pointer-events-auto w-[min(1180px,calc(100vw-1.5rem))] rounded-[15px] border border-white/10 bg-black px-3 py-2.5 text-white shadow-[0_18px_42px_rgba(0,0,0,0.18)] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-5 ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-5">
          <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-4">
            {links.map(({ label, href, key }) => (
              <NavLink key={label} href={href} isActive={active === key}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Brand mark — only fades in AFTER hero block has morphed away,
              preventing a duplicate logo during the transition */}
          <div
            className={`ml-auto flex items-center gap-2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              phase === "complete" || phase === "always"
                ? "translate-x-0 opacity-100"
                : "translate-x-2 opacity-0"
            }`}
          >
            <DiamondMark size={18} className="shrink-0" />
            <span
              className={`text-[0.78rem] uppercase tracking-[0.32em] text-white transition-all duration-500 sm:text-[0.84rem] ${
                phase === "complete" || phase === "always" ? "font-balgin" : "font-brand"
              }`}
            >
              Jewel Avenue
            </span>
          </div>
        </div>
      </div>

      {/* Glow line */}
      <div className="pointer-events-none fixed left-1/2 top-[4.75rem] z-30 w-[min(1180px,calc(100vw-1.5rem))] -translate-x-1/2 px-1 sm:top-[5rem] sm:px-0">
        <div
          className={`h-[2px] origin-left rounded-full bg-[linear-gradient(90deg,rgba(212,175,55,0.15)_0%,#d4af37_18%,rgba(255,255,255,0.95)_50%,#d4af37_82%,rgba(212,175,55,0.18)_100%)] bg-[length:200%_100%] shadow-[0_0_14px_rgba(212,175,55,0.45)] transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            glowVisible ? "scale-x-100 animate-jewel-line-shimmer" : "scale-x-0"
          }`}
          style={{ transitionDelay: glowVisible ? "120ms" : "0ms" }}
        />
      </div>
    </header>
  );
}
