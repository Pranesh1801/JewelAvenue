"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  pinCode: string;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  loading: boolean;
  onAdd: (data: { name: string; phone: string; line1: string; city: string; pinCode: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function AddressModal({ isOpen, onClose, addresses, loading, onAdd, onDelete }: AddressModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "",
    pinCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.line1 || !form.city || !form.pinCode) return;
    await onAdd(form);
    setForm({ name: "", phone: "", line1: "", city: "", pinCode: "" });
    setShowAddForm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
            style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(10px)" }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-[94vw] max-w-[650px] max-h-[85vh] overflow-hidden rounded-[28px] border border-[#D4AF37]/20 bg-[#FBF5EE] shadow-[0_30px_90px_rgba(0,0,0,0.18)] p-6 sm:p-8 flex flex-col relative z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full bg-white/60 p-2 text-gray-500 hover:text-black border border-black/5 hover:border-black/20 hover:scale-105 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.05)] cursor-pointer z-10"
              title="Close Address Book"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6 flex-shrink-0">
              <h2 className="text-[1.1rem] font-brand uppercase tracking-[0.2em] text-[#0a0a0a]">✦ Address Book ✦</h2>
              <p className="text-[0.68rem] tracking-[0.1em] uppercase text-gray-400 mt-1">Manage Shipping Destinations</p>
              <div style={{ height: "1px", width: "120px", margin: "12px auto 0", background: "linear-gradient(90deg, transparent, #D4AF37 50%, transparent)" }} />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6" style={{ scrollbarWidth: "thin", scrollbarColor: "#D4AF37 transparent" }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D4AF37]" />
                  <span className="text-[0.7rem] uppercase tracking-[0.1em]">Syncing address book...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#D4AF37]/20 rounded-2xl bg-white/40">
                  <span className="text-xl text-[#D4AF37]">✦</span>
                  <p className="text-[0.75rem] uppercase tracking-[0.12em] text-gray-400 mt-2">No saved shipping destinations found</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {addresses.map((addr) => (
                    <motion.div
                      layout
                      key={addr.id}
                      className="group relative flex items-start justify-between rounded-2xl bg-white/70 border border-[#D4AF37]/15 p-4 transition-all hover:bg-[#FDFAF4] hover:shadow-[0_4px_16px_rgba(212,175,55,0.06)] hover:border-[#D4AF37]/35"
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.7rem] text-[#D4AF37]">✦</span>
                          <p className="text-[0.8rem] font-bold text-black uppercase tracking-[0.05em]">{addr.name}</p>
                        </div>
                        <p className="text-[0.75rem] text-gray-600 pl-4 leading-relaxed">{addr.line1}</p>
                        <p className="text-[0.68rem] text-gray-400 pl-4 uppercase tracking-[0.05em]">{addr.city} · {addr.pinCode}</p>
                        {addr.phone && <p className="text-[0.68rem] text-gray-400 pl-4 mt-0.5">📞 {addr.phone}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => onDelete(addr.id)}
                        className="text-red-400/60 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 cursor-pointer"
                        title="Remove Destination"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add New Address Form Section */}
              <div className="pt-2">
                {!showAddForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-3.5 border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl text-center text-[0.7rem] uppercase tracking-[0.14em] font-semibold text-black transition-all hover:bg-black hover:text-white bg-white/60 cursor-pointer"
                  >
                    + Register New Shipping Destination
                  </button>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4 bg-white/50 p-5 rounded-2xl border border-[#D4AF37]/15"
                  >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-black/5">
                      <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#D4AF37]">✦ Add New Shipping Address</h3>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="text-[0.65rem] uppercase tracking-[0.1em] text-gray-400 hover:text-black cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[0.58rem] uppercase tracking-[0.12em] text-gray-400 mb-1">Name *</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2 text-[0.78rem] text-black outline-none focus:border-[#D4AF37] focus:shadow-[0_0_10px_rgba(212,175,55,0.15)] transition-all placeholder:text-gray-300"
                          placeholder="E.g. Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.58rem] uppercase tracking-[0.12em] text-gray-400 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2 text-[0.78rem] text-black outline-none focus:border-[#D4AF37] focus:shadow-[0_0_10px_rgba(212,175,55,0.15)] transition-all placeholder:text-gray-300"
                          placeholder="E.g. +91 98765 43210"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[0.58rem] uppercase tracking-[0.12em] text-gray-400 mb-1">Street Address *</label>
                        <input
                          type="text"
                          required
                          value={form.line1}
                          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
                          className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2 text-[0.78rem] text-black outline-none focus:border-[#D4AF37] focus:shadow-[0_0_10px_rgba(212,175,55,0.15)] transition-all placeholder:text-gray-300"
                          placeholder="E.g. Suite 402, BKC Towers"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.58rem] uppercase tracking-[0.12em] text-gray-400 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={form.city}
                          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                          className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2 text-[0.78rem] text-black outline-none focus:border-[#D4AF37] focus:shadow-[0_0_10px_rgba(212,175,55,0.15)] transition-all placeholder:text-gray-300"
                          placeholder="E.g. Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.58rem] uppercase tracking-[0.12em] text-gray-400 mb-1">PIN Code *</label>
                        <input
                          type="text"
                          required
                          value={form.pinCode}
                          onChange={(e) => setForm((f) => ({ ...f, pinCode: e.target.value }))}
                          className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2 text-[0.78rem] text-black outline-none focus:border-[#D4AF37] focus:shadow-[0_0_10px_rgba(212,175,55,0.15)] transition-all placeholder:text-gray-300"
                          placeholder="E.g. 400051"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-full text-[0.7rem] font-semibold text-white uppercase tracking-[0.14em] transition-all bg-black hover:bg-black/90 hover:shadow-[0_0_16px_rgba(212,175,55,0.35)] cursor-pointer"
                    >
                      Save Address
                    </button>
                  </motion.form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
