"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { canViewUsers } from "@/lib/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
  _count: { orders: number; cartItems: number };
}

export default function AdminUsersPage() {
  const { data: session } = useSession();

  // Guard: only ADMIN may view user data
  if (!canViewUsers(session?.user.role)) return <AccessDenied />;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${search}`);
      if (res.ok) { const data = await res.json(); setUsers(data.users || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const updateRole = async (userId: string, role: string) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, role }),
    });
    load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-[1.3rem] font-brand uppercase tracking-[0.18em] text-white">Users</h1>
        <input
          type="text" placeholder="Search users..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[0.8rem] text-white outline-none focus:border-[#D4AF37]/40 w-[220px] placeholder:text-white/25"
        />
      </div>

      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.78rem]">
            <thead>
              <tr className="border-b border-white/5">
                {["User", "Email", "Role", "Orders", "Cart Items", "Joined", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/40 font-medium uppercase tracking-[0.1em] text-[0.6rem]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30">No users found</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="border-b border-white/3 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/80">{user.name || "—"}</td>
                  <td className="px-4 py-3 text-white/60">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[0.6rem] uppercase tracking-[0.08em] ${
                      user.role === "ADMIN" ? "text-[#D4AF37] bg-[#D4AF37]/10" :
                      user.role === "MARKETING" ? "text-[#8B5CF6] bg-[#8B5CF6]/10" :
                      "text-white/40 bg-white/5"
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-white/50">{user._count.orders}</td>
                  <td className="px-4 py-3 text-white/50">{user._count.cartItems}</td>
                  <td className="px-4 py-3 text-white/40 text-[0.72rem]">{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={e => updateRole(user.id, e.target.value)}
                      className="bg-[#141414] border border-white/10 rounded-lg px-2.5 py-1.5 text-[0.68rem] text-white/80 outline-none focus:border-[#D4AF37]/50 transition-all cursor-pointer"
                      style={{ appearance: "none", backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23D4AF37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: "right 0.5rem center", backgroundSize: "1.25em 1.25em", backgroundRepeat: "no-repeat", paddingRight: "1.8rem" }}
                    >
                      <option value="CUSTOMER" className="bg-[#141414] text-white">Customer</option>
                      <option value="MARKETING" className="bg-[#141414] text-white">Marketing</option>
                      <option value="ADMIN" className="bg-[#141414] text-white">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
