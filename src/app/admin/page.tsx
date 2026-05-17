"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white/30 text-sm uppercase tracking-[0.2em]">Loading dashboard...</div>
      </div>
    );
  }

  const cards = [
    { label: "Total Products", value: stats?.totalProducts ?? 0, icon: "💎", color: "#D4AF37" },
    { label: "Categories", value: stats?.totalCategories ?? 0, icon: "📁", color: "#046307" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: "📦", color: "#3B82F6" },
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: "👥", color: "#8B5CF6" },
    { label: "Revenue", value: `₹${((stats?.totalRevenue ?? 0) / 100).toLocaleString("en-IN")}`, icon: "💰", color: "#D4AF37" },
  ];

  return (
    <div>
      <h1 className="text-[1.3rem] font-brand uppercase tracking-[0.18em] text-white mb-6">
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 border border-white/5"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: card.color, boxShadow: `0 0 8px ${card.color}40` }}
              />
            </div>
            <p className="text-[1.4rem] font-semibold text-white">{card.value}</p>
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/40 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-[0.8rem] uppercase tracking-[0.18em] text-white/60">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.78rem]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/40 font-medium uppercase tracking-[0.12em] text-[0.65rem]">Order #</th>
                <th className="text-left px-5 py-3 text-white/40 font-medium uppercase tracking-[0.12em] text-[0.65rem]">Customer</th>
                <th className="text-left px-5 py-3 text-white/40 font-medium uppercase tracking-[0.12em] text-[0.65rem]">Amount</th>
                <th className="text-left px-5 py-3 text-white/40 font-medium uppercase tracking-[0.12em] text-[0.65rem]">Status</th>
                <th className="text-left px-5 py-3 text-white/40 font-medium uppercase tracking-[0.12em] text-[0.65rem]">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/3 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-[#D4AF37] font-mono text-[0.72rem]">
                      {order.orderNumber.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-3 text-white/70">{order.user?.name || order.user?.email || "—"}</td>
                    <td className="px-5 py-3 text-white/80 font-medium">
                      ₹{(order.totalAmount / 100).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-[0.6rem] uppercase tracking-[0.1em] font-semibold"
                        style={{
                          background: order.status === "DELIVERED" ? "rgba(4,99,7,0.15)" :
                                     order.status === "PENDING" ? "rgba(212,175,55,0.12)" :
                                     order.status === "CANCELLED" ? "rgba(220,38,38,0.12)" :
                                     "rgba(59,130,246,0.12)",
                          color: order.status === "DELIVERED" ? "#22c55e" :
                                 order.status === "PENDING" ? "#D4AF37" :
                                 order.status === "CANCELLED" ? "#ef4444" :
                                 "#3B82F6",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/40 text-[0.72rem]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-white/30 text-[0.78rem]">
                    No orders yet — they&apos;ll appear here once customers start shopping.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
