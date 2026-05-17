"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DiamondMark } from "./DiamondMark";
import { useCart } from "@/context/CartContext";

type NavbarProps = {
  phase?: "loader" | "hero" | "nav" | "complete" | "always";
  active?: "home" | "collections" | "about" | "contact";
  fixed?: boolean;
};

const BRAND = "Jewel Avenue";

const links: { label: string; href: string; key: NavbarProps["active"] }[] = [
  { label: "Home", href: "/", key: "home" },
  { label: "Collections", href: "/collections", key: "collections" },
  { label: "About", href: "/#about", key: "about" },
  { label: "Contact", href: "/#contact", key: "contact" },
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
        textShadow: hovered ? "0 0 8px rgba(212,175,55,0.6)" : "none",
        transition: "color 0.3s ease-in-out, text-shadow 0.3s ease-in-out",
      }}
    >
      {children}
    </Link>
  );
}

function CartIcon() {
  const { getTotalItems, cartIconRef, lastAdded } = useCart();
  const count = getTotalItems();
  const [bumping, setBumping] = useState(false);
  const [hovered, setHovered] = useState(false);
  const prevLastAdded = useRef<string | null>(null);

  useEffect(() => {
    if (lastAdded && lastAdded !== prevLastAdded.current) {
      prevLastAdded.current = lastAdded;
      setBumping(true);
      const t = setTimeout(() => setBumping(false), 400);
      return () => clearTimeout(t);
    }
  }, [lastAdded]);

  return (
    <Link href="/cart" aria-label="Cart">
      <button
        ref={cartIconRef}
        type="button"
        id="navbar-cart-icon"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative inline-flex items-center justify-center shrink-0"
        style={{
          width: 32,
          height: 32,
          cursor: "pointer",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.2s ease",
          filter: hovered ? "drop-shadow(0 0 6px rgba(212,175,55,0.7))" : "none",
          background: "none",
          border: "none",
          padding: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {count > 0 && (
          <span
            className={bumping ? "badge-bump" : ""}
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: "#D4AF37",
              color: "#000",
              fontSize: "0.6rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              lineHeight: 1,
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            {count}
          </span>
        )}
      </button>
    </Link>
  );
}

// ── Mobile drawer ──────────────────────────────────────────────────────────────
function MobileDrawer({
  open,
  onClose,
  active,
}: {
  open: boolean;
  onClose: () => void;
  active?: NavbarProps["active"];
}) {
  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60"
            style={{ backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed left-0 top-0 z-[70] flex h-full w-[72vw] max-w-[280px] flex-col bg-black"
            style={{ borderRight: "1px solid rgba(212,175,55,0.18)" }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <DiamondMark size={18} />
                <span className="font-balgin text-[0.72rem] uppercase tracking-[0.24em] text-white">
                  Jewel Avenue
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center text-white/50 transition-colors hover:text-[#D4AF37]"
                aria-label="Close menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-0.5 px-3 py-5">
              {links.map(({ label, href, key }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + i * 0.055, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200"
                    style={{
                      color: active === key ? "#D4AF37" : "rgba(255,255,255,0.65)",
                      background: active === key ? "rgba(212,175,55,0.07)" : "transparent",
                    }}
                  >
                    {active === key && (
                      <span
                        style={{
                          width: 3,
                          height: 14,
                          borderRadius: 2,
                          background: "#D4AF37",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span className="font-ui text-[0.7rem] font-medium uppercase tracking-[0.26em]">
                      {label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Footer rule */}
            <div className="mt-auto px-5 pb-8">
              <div
                style={{
                  height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)",
                }}
              />
              <p className="mt-4 text-center font-ui text-[0.58rem] uppercase tracking-[0.2em] text-white/20">
                Luxury Jewellery
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
export function Navbar({ phase = "always", active, fixed = true }: NavbarProps) {
  const isVisible = phase === "always" || phase === "nav" || phase === "complete";
  const glowVisible = phase === "always" || phase === "complete";
  const brandVisible = phase === "complete" || phase === "always";

  const [typed, setTyped] = useState("");
  const hasTyped = useRef(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!brandVisible || hasTyped.current) return;
    hasTyped.current = true;
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setTyped(BRAND.slice(0, i));
      if (i === BRAND.length) window.clearInterval(id);
    }, 78);
    return () => window.clearInterval(id);
  }, [brandVisible]);

  return (
    <>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} active={active} />

      <header
        className={`pointer-events-none ${
          fixed ? "fixed inset-x-0 top-0" : "relative w-full"
        } z-40 flex justify-center px-3 pt-4 sm:px-4 sm:pt-5`}
      >
        <div
          className={`pointer-events-auto w-[min(1180px,calc(100vw-1.5rem))] rounded-[15px] border border-white/10 bg-black px-3 py-2.5 text-white shadow-[0_18px_42px_rgba(0,0,0,0.18)] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-5 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          {/* ── MOBILE ROW (hidden at md+) ── */}
          <div className="flex items-center justify-between md:hidden">
            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-8 w-8 items-center justify-center text-white/70 transition-colors hover:text-[#D4AF37]"
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Brand — center */}
            <div
              className={`flex items-center gap-1.5 transition-all duration-700 ${
                brandVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <DiamondMark size={15} className="shrink-0" />
              <span className="font-balgin text-[0.68rem] uppercase tracking-[0.22em] text-white">
                {typed}
              </span>
            </div>

            {/* Cart */}
            <CartIcon />
          </div>

          {/* ── DESKTOP ROW (hidden below md) — untouched ── */}
          <div className="hidden items-center gap-3 md:flex sm:gap-5">
            <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-4">
              {links.map(({ label, href, key }) => (
                <NavLink key={label} href={href} isActive={active === key}>
                  {label}
                </NavLink>
              ))}
            </nav>

            <div
              className={`ml-auto flex items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                brandVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-2 opacity-0"
              }`}
            >
              <CartIcon />

              <span id="navbar-brand-anchor" className="inline-flex shrink-0">
                <DiamondMark size={18} className="shrink-0" />
              </span>

              <span
                className={`text-[0.78rem] uppercase tracking-[0.32em] text-white transition-all duration-500 sm:text-[0.84rem] ${
                  brandVisible ? "font-balgin" : "font-brand"
                }`}
              >
                {typed}
              </span>
            </div>
          </div>
        </div>

        {/* Gold shimmer line — untouched */}
        <div
          className={`pointer-events-none ${
            fixed ? "fixed" : "absolute"
          } left-1/2 top-[4.75rem] z-30 w-[min(1180px,calc(100vw-1.5rem))] -translate-x-1/2 px-1 sm:top-[5rem] sm:px-0`}
        >
          <div
            className={`h-[2px] origin-left rounded-full bg-[linear-gradient(90deg,rgba(212,175,55,0.15)_0%,#d4af37_18%,rgba(255,255,255,0.95)_50%,#d4af37_82%,rgba(212,175,55,0.18)_100%)] bg-[length:200%_100%] shadow-[0_0_14px_rgba(212,175,55,0.45)] transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              glowVisible ? "scale-x-100 animate-jewel-line-shimmer" : "scale-x-0"
            }`}
            style={{ transitionDelay: glowVisible ? "120ms" : "0ms" }}
          />
        </div>
      </header>
    </>
  );
}
