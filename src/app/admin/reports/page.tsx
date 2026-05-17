"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["#D4AF37", "#046307", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#14B8A6"];

interface RevenueData {
  summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number };
  data: Array<{ date: string; revenue: number; orders: number }>;
}

interface ProductData {
  topSellers: Array<{ name: string; totalQuantity: number; totalRevenue: number }>;
  categories: Array<{ title: string; totalRevenue: number; productCount: number; totalSold: number }>;
  lowStock: Array<{ name: string; stock: number; styleCode: string }>;
}

interface UserData {
  summary: {
    totalUsers: number; newUsers: number; usersWithOrders: number;
    cartAbandonment: number; conversionRate: string;
  };
  dailySignups: Array<{ date: string; count: number }>;
}

export default function AdminReportsPage() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [products, setProducts] = useState<ProductData | null>(null);
  const [users, setUsers] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [revRes, prodRes, userRes] = await Promise.all([
          fetch(`/api/reports/revenue?period=${period}`),
          fetch("/api/reports/products"),
          fetch("/api/reports/users"),
        ]);
        if (revRes.ok) setRevenue(await revRes.json());
        if (prodRes.ok) setProducts(await prodRes.json());
        if (userRes.ok) setUsers(await userRes.json());
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    load();
  }, [period]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><span className="text-white/30 text-sm uppercase tracking-[0.2em]">Loading reports...</span></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-[1.3rem] font-brand uppercase tracking-[0.18em] text-white">Reports</h1>
        <div className="flex gap-2">
          {["daily", "weekly", "monthly"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-[0.68rem] uppercase tracking-[0.1em] border transition-all"
              style={{
                borderColor: period === p ? "#D4AF37" : "rgba(255,255,255,0.1)",
                color: period === p ? "#D4AF37" : "rgba(255,255,255,0.4)",
                background: period === p ? "rgba(212,175,55,0.08)" : "transparent",
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Total Revenue", value: `₹${(revenue?.summary.totalRevenue ?? 0).toLocaleString("en-IN")}`, icon: "💰" },
          { label: "Total Orders", value: revenue?.summary.totalOrders ?? 0, icon: "📦" },
          { label: "Avg Order Value", value: `₹${Math.round(revenue?.summary.avgOrderValue ?? 0).toLocaleString("en-IN")}`, icon: "📊" },
          { label: "Conversion Rate", value: `${users?.summary.conversionRate ?? 0}%`, icon: "🎯" },
          { label: "Cart Abandonment", value: users?.summary.cartAbandonment ?? 0, icon: "🛒" },
        ].map(card => (
          <div key={card.label} className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-lg">{card.icon}</span>
            <p className="text-[1.1rem] font-semibold text-white mt-1">{card.value}</p>
            <p className="text-[0.58rem] uppercase tracking-[0.12em] text-white/35 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-2xl border border-white/5 p-5 mb-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <h3 className="text-[0.75rem] uppercase tracking-[0.14em] text-white/50 mb-4">Revenue Over Time</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={revenue?.data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Sellers */}
        <div className="rounded-2xl border border-white/5 p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
          <h3 className="text-[0.75rem] uppercase tracking-[0.14em] text-white/50 mb-4">Top Selling Products</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={(products?.topSellers || []).slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="totalQuantity" fill="#D4AF37" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue */}
        <div className="rounded-2xl border border-white/5 p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
          <h3 className="text-[0.75rem] uppercase tracking-[0.14em] text-white/50 mb-4">Revenue by Category</h3>
          <div style={{ width: "100%", height: 250 }} className="flex items-center justify-center">
            {(products?.categories || []).length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={products?.categories || []}
                    dataKey="totalRevenue"
                    nameKey="title"
                    cx="50%" cy="50%"
                    outerRadius={90}
                    label={({ title, percent }) => `${title} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(products?.categories || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-white/30 text-[0.8rem]">No sales data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* User Growth */}
      <div className="rounded-2xl border border-white/5 p-5 mb-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <h3 className="text-[0.75rem] uppercase tracking-[0.14em] text-white/50 mb-4">User Signups</h3>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={users?.dailySignups || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" fill="#046307" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {products?.lowStock && products.lowStock.length > 0 && (
        <div className="rounded-2xl border border-red-500/20 p-5" style={{ background: "rgba(239,68,68,0.03)" }}>
          <h3 className="text-[0.75rem] uppercase tracking-[0.14em] text-red-400/70 mb-3">⚠️ Low Stock Alerts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.lowStock.map(p => (
              <div key={p.styleCode} className="flex justify-between items-center px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10">
                <span className="text-white/70 text-[0.78rem]">{p.name}</span>
                <span className="text-red-400 font-semibold text-[0.78rem]">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metabase connection info */}
      <div className="mt-8 rounded-2xl border border-white/5 p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
        <h3 className="text-[0.75rem] uppercase tracking-[0.14em] text-white/50 mb-3">🔗 External Reporting Tools</h3>
        <div className="text-[0.78rem] text-white/40 space-y-2">
          <p><strong className="text-white/60">Metabase:</strong> Connect directly to your Supabase PostgreSQL using the DATABASE_URL from your .env</p>
          <p><strong className="text-white/60">Google Analytics 4:</strong> Set NEXT_PUBLIC_GA4_ID in your environment variables</p>
          <p><strong className="text-white/60">Microsoft Clarity:</strong> Set NEXT_PUBLIC_CLARITY_ID in your environment variables</p>
          <p><strong className="text-white/60">API Access:</strong> Use the REPORTS_API_KEY header (x-api-key) to access /api/reports/* endpoints from external tools</p>
        </div>
      </div>
    </div>
  );
}
