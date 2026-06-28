"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import { DiamondMark } from "@/components/home/DiamondMark";
import { getNavItemsForRole } from "@/lib/permissions";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
      return;
    }
    if (
      status === "authenticated" &&
      session?.user.role !== "ADMIN" &&
      session?.user.role !== "MARKETING"
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <DiamondMark size={40} />
      </div>
    );
  }

  // Redirecting — show spinner instead of blank screen
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKETING")) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <DiamondMark size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[240px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#111] transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
          <DiamondMark size={20} />
          <div>
            <span className="font-balgin text-[0.7rem] uppercase tracking-[0.2em] text-white">
              Jewel Avenue
            </span>
            <span className="block text-[0.55rem] uppercase tracking-[0.18em] text-[#D4AF37]">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1">
          {getNavItemsForRole(session.user.role).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.75rem] font-medium transition-all duration-200"
                style={{
                  color: isActive ? "#D4AF37" : "rgba(255,255,255,0.5)",
                  background: isActive ? "rgba(212,175,55,0.08)" : "transparent",
                }}
              >
                <span className="text-base">{item.icon}</span>
                <span className="uppercase tracking-[0.14em]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-white/5 px-4 py-4">
          <p className="text-[0.7rem] text-white/40 truncate">{session.user.email}</p>
          <p className="text-[0.6rem] text-[#D4AF37] uppercase tracking-[0.14em]">{session.user.role}</p>
        </div>

        {/* Back to site */}
        <div className="px-4 pb-4">
          <Link
            href="/"
            className="block text-center text-[0.65rem] uppercase tracking-[0.14em] text-white/30 hover:text-[#D4AF37] transition-colors"
          >
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar (mobile) */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-white/60 hover:text-[#D4AF37]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="font-balgin text-[0.7rem] uppercase tracking-[0.2em] text-white">Admin</span>
          <div className="w-5" />
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
