"use client";

import { useEffect, useState, useCallback } from "react";

interface Category {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  iconType: string;
  href: string | null;
  sortOrder: number;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ slug: "", title: "", tagline: "", iconType: "ring", href: "", sortOrder: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) setCategories(await res.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ slug: "", title: "", tagline: "", iconType: "ring", href: "", sortOrder: categories.length });
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ slug: cat.slug, title: cat.title, tagline: cat.tagline, iconType: cat.iconType, href: cat.href || "", sortOrder: cat.sortOrder });
    setEditing(cat);
    setCreating(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/admin/categories", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { setCreating(false); setEditing(null); load(); }
      else { const err = await res.json(); alert(err.error || "Failed"); }
    } catch { alert("Network error"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete category "${title}"?`)) return;
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    if (!res.ok) { const err = await res.json(); alert(err.error); return; }
    load();
  };

  const inputStyle = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[0.82rem] text-white outline-none focus:border-[#D4AF37]/50 placeholder:text-white/20";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[1.3rem] font-brand uppercase tracking-[0.18em] text-white">Categories</h1>
        <button onClick={openCreate} className="rounded-xl px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-black" style={{ background: "#D4AF37" }}>
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-white/30 text-sm col-span-3 text-center py-8">Loading...</p>
        ) : categories.map(cat => (
          <div key={cat.id} className="rounded-2xl border border-white/5 p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white/80 font-medium text-[0.9rem]">{cat.title}</h3>
                <p className="text-white/30 text-[0.68rem]">{cat.slug}</p>
              </div>
              <span className="text-[0.65rem] text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-full">{cat._count.products} products</span>
            </div>
            <p className="text-white/40 text-[0.75rem] mb-3">{cat.tagline}</p>
            <div className="flex gap-2">
              <button onClick={() => openEdit(cat)} className="text-[#D4AF37] text-[0.7rem] hover:text-white transition-colors">Edit</button>
              <button onClick={() => handleDelete(cat.id, cat.title)} className="text-red-400/60 text-[0.7rem] hover:text-red-400 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {creating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-[480px] rounded-2xl border border-white/10 bg-[#141414] p-6">
            <h2 className="text-[0.9rem] font-brand uppercase tracking-[0.16em] text-white mb-5">
              {editing ? "Edit Category" : "New Category"}
            </h2>
            <div className="flex flex-col gap-3">
              <div><label className="block text-[0.62rem] uppercase tracking-[0.14em] text-white/40 mb-1">Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputStyle} /></div>
              {!editing && <div><label className="block text-[0.62rem] uppercase tracking-[0.14em] text-white/40 mb-1">Slug</label><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={inputStyle} placeholder="rings" /></div>}
              <div><label className="block text-[0.62rem] uppercase tracking-[0.14em] text-white/40 mb-1">Tagline</label><input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} className={inputStyle} /></div>
              <div><label className="block text-[0.62rem] uppercase tracking-[0.14em] text-white/40 mb-1">Icon Type</label><input value={form.iconType} onChange={e => setForm(f => ({ ...f, iconType: e.target.value }))} className={inputStyle} /></div>
              <div><label className="block text-[0.62rem] uppercase tracking-[0.14em] text-white/40 mb-1">Link (href)</label><input value={form.href} onChange={e => setForm(f => ({ ...f, href: e.target.value }))} className={inputStyle} placeholder="/collections/rings" /></div>
              <div><label className="block text-[0.62rem] uppercase tracking-[0.14em] text-white/40 mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} className={inputStyle} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 rounded-lg text-[0.72rem] text-white/40 border border-white/10 uppercase tracking-[0.1em]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg text-[0.72rem] font-semibold text-black uppercase tracking-[0.1em] disabled:opacity-50" style={{ background: "#D4AF37" }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
