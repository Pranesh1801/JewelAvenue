"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DiamondMark } from "./DiamondMark";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";

type NavbarProps = {
  phase?: "loader" | "hero" | "nav" | "complete" | "always";
  active?: "home" | "collections" | "about" | "contact";
  fixed?: boolean;
};

const BRAND = "Jewel Avenue";

interface CategoryItem {
  id: string;
  slug: string;
  title: string;
}

// ── Collections dropdown ───────────────────────────────────────────────────────
function CollectionsDropdown({
  isActive,
  categories,
}: {
  isActive: boolean;
  categories: CategoryItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Pure button — no navigation, just opens the dropdown */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 whitespace-nowrap font-ui text-[0.63rem] font-medium uppercase tracking-[0.28em] transition-colors duration-300 sm:text-[0.72rem] bg-transparent border-none cursor-pointer"
        style={{
          color: isActive || open ? "#D4AF37" : "rgba(255,255,255,0.6)",
          textShadow: open ? "0 0 8px rgba(212,175,55,0.6)" : "none",
          padding: 0,
        }}
      >
        Collections
        {/* Chevron */}
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            opacity: 0.7,
          }}
        >
          <path d="M1 3L5 7L9 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown panel — category list only */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 top-full mt-3 min-w-[180px] rounded-[14px] border border-[#D4AF37]/20 bg-black/95 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-md z-[80]"
          >
            {categories.length === 0 ? (
              <p className="px-4 py-2 text-[0.6rem] text-white/30">Loading…</p>
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/collections/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="block px-5 py-2.5 text-[0.65rem] font-ui uppercase tracking-[0.18em] text-white/70 hover:text-[#D4AF37] hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] last:border-0"
                >
                  {cat.title}
                </Link>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


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

interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pinCode: string;
}

// Compact inline address accordion — embedded inside the profile dropdown
function AddressSection({
  addresses,
  loading,
  onRefresh,
  onDelete,
}: {
  addresses: Address[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", line1: "", city: "", pinCode: "" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.line1 || !form.city || !form.pinCode) return;
    setSaving(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", phone: "", line1: "", city: "", pinCode: "" });
        setShowForm(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full rounded-md bg-white/5 border border-white/10 px-2.5 py-1.5 text-[0.65rem] text-white outline-none focus:border-[#D4AF37]/50 placeholder:text-white/20 transition-colors";

  return (
    <div className="border-t border-white/5 pt-2">
      <button
        type="button"
        onClick={() => { setExpanded(v => !v); setShowForm(false); }}
        className="flex w-full items-center justify-between py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-white/60 hover:text-[#D4AF37] transition-colors"
      >
        <span>✦ Address Book</span>
        <span className="text-[0.55rem] opacity-60">{expanded ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {loading ? (
                <p className="text-[0.6rem] text-white/30 italic px-1">Loading...</p>
              ) : addresses.length === 0 ? (
                <p className="text-[0.6rem] text-white/30 italic px-1">No saved addresses</p>
              ) : (
                <div className="space-y-1.5 max-h-[130px] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#D4AF37 transparent" }}>
                  {addresses.map((addr) => (
                    <div key={addr.id} className="flex items-start justify-between rounded-lg bg-white/[0.04] border border-white/5 px-2.5 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.68rem] font-semibold text-white/90 truncate">{addr.name}</p>
                        <p className="text-[0.6rem] text-white/50 truncate">{addr.line1}</p>
                        <p className="text-[0.58rem] text-white/35">{addr.city} · {addr.pinCode}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDelete(addr.id)}
                        className="ml-2 mt-0.5 text-white/25 hover:text-red-400 transition-colors text-[0.75rem] shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!showForm ? (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full text-center text-[0.6rem] uppercase tracking-[0.1em] text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors py-0.5"
                >
                  + Add Address
                </button>
              ) : (
                <form onSubmit={handleAdd} className="space-y-1.5 pt-1">
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="Full name *" required />
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inp} placeholder="Phone (optional)" />
                  <input value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} className={inp} placeholder="Street address *" required />
                  <div className="flex gap-1.5">
                    <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inp} placeholder="City *" required />
                    <input value={form.pinCode} onChange={e => setForm(f => ({ ...f, pinCode: e.target.value }))} className={inp} placeholder="PIN *" required />
                  </div>
                  <div className="flex justify-end gap-2 pt-0.5">
                    <button type="button" onClick={() => setShowForm(false)} className="text-[0.58rem] uppercase tracking-[0.08em] text-white/30 hover:text-white transition-colors">Cancel</button>
                    <button type="submit" disabled={saving} className="text-[0.6rem] uppercase tracking-[0.1em] font-semibold text-[#D4AF37] hover:text-white disabled:opacity-50 transition-colors">{saving ? "Saving..." : "Save"}</button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileIcon() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Address section state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddrs, setLoadingAddrs] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAddresses = async () => {
    setLoadingAddrs(true);
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAddrs(false);
    }
  };

  useEffect(() => {
    if (session && open) {
      fetchAddresses();
    }
  }, [session, open]);

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center justify-center shrink-0"
        style={{
          width: 32,
          height: 32,
          cursor: "pointer",
          transform: hovered || open ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.2s ease",
          filter: hovered || open ? "drop-shadow(0 0 6px rgba(212,175,55,0.7))" : "none",
          background: "none",
          border: "none",
          padding: 0,
        }}
        aria-label="Account Menu"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-[290px] rounded-2xl border border-[#D4AF37]/20 bg-black/95 p-5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md z-[60]"
          >
            {!session ? (
              // LOGGED OUT STATE
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <p className="font-balgin text-[0.62rem] uppercase tracking-[0.2em] text-[#D4AF37] mb-1">
                    Jewel Avenue
                  </p>
                  <p className="text-[0.65rem] text-white/50 tracking-wider">
                    Sign in to customize & manage your luxury orders
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-xl bg-[#D4AF37] py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-black hover:bg-[#D4AF37]/90 transition duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-xl border border-white/10 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white hover:bg-white/5 hover:border-[#D4AF37]/35 transition duration-300"
                  >
                    Register
                  </Link>
                </div>
              </div>
            ) : (
              // LOGGED IN STATE
              <div className="flex flex-col gap-3">
                {/* User info details */}
                <div className="pb-2 border-b border-white/5">
                  <p className="text-[0.72rem] text-white/40 tracking-wider">Welcome,</p>
                  <p className="font-brand font-semibold text-[0.85rem] text-white tracking-wide truncate">
                    {session.user.name || "Customer"}
                  </p>
                  <p className="text-[0.65rem] text-white/50 truncate font-ui">
                    {session.user.email}
                  </p>
                </div>

                {/* Admin/Marketing role button */}
                {(session.user.role === "ADMIN" || session.user.role === "MARKETING") && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1.5 text-[0.68rem] text-[#D4AF37] uppercase tracking-[0.1em] hover:bg-[#D4AF37]/20 transition-all"
                  >
                    <span>📊</span>
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Inline compact address book */}
                <AddressSection
                  addresses={addresses}
                  loading={loadingAddrs}
                  onRefresh={fetchAddresses}
                  onDelete={handleDeleteAddress}
                />

                {/* Sign out link */}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left text-[0.65rem] uppercase tracking-[0.14em] text-red-400/80 hover:text-red-400 transition duration-200 pt-1"
                >
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Mobile drawer ──────────────────────────────────────────────────────────────
function MobileDrawer({
  open,
  onClose,
  active,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  active?: NavbarProps["active"];
  categories: CategoryItem[];
}) {
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const staticLinks = [
    { label: "Home", href: "/", key: "home" as const },
    { label: "About", href: "/#about", key: "about" as const },
    { label: "Contact", href: "/#contact", key: "contact" as const },
  ];

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
            className="fixed left-0 top-0 z-[70] flex h-full w-[72vw] max-w-[280px] flex-col bg-black overflow-y-auto"
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
              {/* Home */}
              {staticLinks.slice(0, 1).map(({ label, href, key }, i) => (
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
                      <span style={{ width: 3, height: 14, borderRadius: 2, background: "#D4AF37", flexShrink: 0 }} />
                    )}
                    <span className="font-ui text-[0.7rem] font-medium uppercase tracking-[0.26em]">{label}</span>
                  </Link>
                </motion.div>
              ))}

              {/* Collections accordion */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.115, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={() => setCollectionsOpen(v => !v)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 transition-colors duration-200"
                  style={{
                    color: active === "collections" ? "#D4AF37" : "rgba(255,255,255,0.65)",
                    background: active === "collections" ? "rgba(212,175,55,0.07)" : "transparent",
                  }}
                >
                  <span className="font-ui text-[0.7rem] font-medium uppercase tracking-[0.26em]">Collections</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                    style={{ transform: collectionsOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                    <path d="M1 3L5 7L9 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden pl-4"
                    >
                      {categories.map(cat => (
                        <Link
                          key={cat.id}
                          href={`/collections/${cat.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-2 px-3 py-2 text-[0.63rem] font-ui uppercase tracking-[0.18em] text-white/55 hover:text-[#D4AF37] transition-colors"
                        >
                          {cat.title}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* About & Contact */}
              {staticLinks.slice(1).map(({ label, href, key }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.17 + i * 0.055, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
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
                      <span style={{ width: 3, height: 14, borderRadius: 2, background: "#D4AF37", flexShrink: 0 }} />
                    )}
                    <span className="font-ui text-[0.7rem] font-medium uppercase tracking-[0.26em]">{label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Footer rule */}
            <div className="mt-auto px-5 pb-8">
              <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)" }} />
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
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Fetch categories for dropdown
  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.ok ? r.json() : [])
      .then((data: CategoryItem[]) => {
        const filtered = data.filter(c =>
          !["automated-collection", "home-page", "frontpage", "hydrogen", "oxygen", "liquid"].includes(c.slug)
        );
        setCategories(filtered);
      })
      .catch(() => {});
  }, []);

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
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} active={active} categories={categories} />

      <header
        className={`pointer-events-none ${
          fixed ? "fixed inset-x-0 top-0" : "relative w-full"
        } z-40 flex justify-center px-3 pt-4 sm:px-4 sm:pt-5`}
      >
        <div
          className={`pointer-events-auto relative z-50 w-[min(1180px,calc(100vw-1.5rem))] rounded-[15px] border border-white/10 bg-black px-3 py-2.5 text-white shadow-[0_18px_42px_rgba(0,0,0,0.18)] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-5 ${
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

            {/* Cart & Profile */}
            <div className="flex items-center gap-3">
              <CartIcon />
              <ProfileIcon />
            </div>
          </div>

          {/* ── DESKTOP ROW (hidden below md) ── */}
          <div className="hidden items-center gap-3 md:flex sm:gap-5">
            <nav className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <NavLink href="/" isActive={active === "home"}>Home</NavLink>
              <CollectionsDropdown isActive={active === "collections"} categories={categories} />
              <NavLink href="/#about" isActive={active === "about"}>About</NavLink>
              <NavLink href="/#contact" isActive={active === "contact"}>Contact</NavLink>
            </nav>

            <div
              className={`ml-auto flex items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                brandVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-2 opacity-0"
              }`}
            >
              <CartIcon />
              <ProfileIcon />

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
