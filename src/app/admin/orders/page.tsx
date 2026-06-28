"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { canViewOrders } from "@/lib/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  taxAmount: number;
  status: string;
  shippingName: string | null;
  shippingEmail: string | null;
  shippingPhone: string | null;
  shippingCity: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    variant: string | null;
    product: { name: string; displayPrice: string };
  }>;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "rgba(212,175,55,0.12)", text: "#D4AF37" },
  CONFIRMED: { bg: "rgba(59,130,246,0.12)", text: "#3B82F6" },
  PROCESSING: { bg: "rgba(168,85,247,0.12)", text: "#A855F7" },
  SHIPPED: { bg: "rgba(14,165,233,0.12)", text: "#0EA5E9" },
  DELIVERED: { bg: "rgba(34,197,94,0.12)", text: "#22C55E" },
  CANCELLED: { bg: "rgba(239,68,68,0.12)", text: "#EF4444" },
  REFUNDED: { bg: "rgba(239,68,68,0.12)", text: "#EF4444" },
};

export default function AdminOrdersPage() {
  const { data: session } = useSession();

  // Guard: only ADMIN may view order / customer data
  if (!canViewOrders(session?.user.role)) return <AccessDenied />;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) { const data = await res.json(); setOrders(data.orders || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status }),
    });
    load();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status } : null);
    }
  };

  return (
    <div>
      <h1 className="text-[1.3rem] font-brand uppercase tracking-[0.18em] text-white mb-6">Orders</h1>

      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.78rem]">
            <thead>
              <tr className="border-b border-white/5">
                {["Order #", "Customer", "Items", "Total", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/40 font-medium uppercase tracking-[0.1em] text-[0.6rem]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30">No orders yet</td></tr>
              ) : orders.map(order => {
                const sc = statusColors[order.status] || statusColors.PENDING;
                return (
                  <tr key={order.id} className="border-b border-white/3 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-[#D4AF37] font-mono text-[0.72rem]">{order.orderNumber.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-white/70">{order.user?.name || order.user?.email}</td>
                    <td className="px-4 py-3 text-white/50">{order.items?.length || 0}</td>
                    <td className="px-4 py-3 text-white/80 font-medium">₹{(order.totalAmount / 100).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[0.6rem] uppercase tracking-[0.1em] font-semibold"
                        style={{ background: sc.bg, color: sc.text }}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-[0.72rem]">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedOrder(order)} className="text-[#D4AF37] text-[0.7rem] hover:text-white transition-colors">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-[560px] max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#141414] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[0.9rem] font-brand uppercase tracking-[0.16em] text-white">
                Order #{selectedOrder.orderNumber.slice(0, 8)}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-white/30 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-[0.8rem]">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-white/40 text-[0.65rem] uppercase">Customer</span><p className="text-white/80">{selectedOrder.shippingName || selectedOrder.user?.name || "—"}</p></div>
                <div><span className="text-white/40 text-[0.65rem] uppercase">Email</span><p className="text-white/80">{selectedOrder.shippingEmail || selectedOrder.user?.email}</p></div>
                <div><span className="text-white/40 text-[0.65rem] uppercase">Phone</span><p className="text-white/80">{selectedOrder.shippingPhone || "—"}</p></div>
                <div><span className="text-white/40 text-[0.65rem] uppercase">City</span><p className="text-white/80">{selectedOrder.shippingCity || "—"}</p></div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <span className="text-white/40 text-[0.65rem] uppercase">Items</span>
                {selectedOrder.items?.map(item => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-white/3">
                    <div>
                      <p className="text-white/80">{item.product.name}</p>
                      {item.variant && <p className="text-white/30 text-[0.7rem]">{item.variant}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-white/60">×{item.quantity}</p>
                      <p className="text-white/80">₹{(item.unitPrice / 100).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-semibold text-white">
                <span>Total</span>
                <span>₹{((selectedOrder.totalAmount + selectedOrder.taxAmount) / 100).toLocaleString("en-IN")}</span>
              </div>

              {/* Status update */}
              <div className="border-t border-white/5 pt-3">
                <span className="text-white/40 text-[0.65rem] uppercase block mb-2">Update Status</span>
                <div className="flex flex-wrap gap-2">
                  {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => (
                    <button key={s} onClick={() => updateStatus(selectedOrder.id, s)}
                      className="px-3 py-1.5 rounded-lg text-[0.65rem] uppercase tracking-[0.08em] border transition-all"
                      style={{
                        borderColor: selectedOrder.status === s ? (statusColors[s]?.text || "#fff") : "rgba(255,255,255,0.1)",
                        color: selectedOrder.status === s ? (statusColors[s]?.text || "#fff") : "rgba(255,255,255,0.4)",
                        background: selectedOrder.status === s ? (statusColors[s]?.bg || "transparent") : "transparent",
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
