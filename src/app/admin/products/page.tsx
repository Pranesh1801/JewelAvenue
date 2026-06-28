"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { canMutateProducts } from "@/lib/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";

interface ProductImage {
  id: string;
  url: string;
  isHover: boolean;
  sortOrder: number;
}

interface ProductCustomization {
  id: string;
  type: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  displayPrice: string;
  subtitle: string | null;
  description: string | null;
  styleCode: string;
  goldWeight: string | null;
  netWeight: string | null;
  diamondCount: string | null;
  diamondWeight: string | null;
  purity: string | null;
  bestseller: boolean;
  stock: number;
  isActive: boolean;
  categoryId: string;
  category: { id: string; title: string; slug: string };
  images: ProductImage[];
  customizations: ProductCustomization[];
  customAttributes?: { label: string; value: string }[] | null;
  _count: { orderItems: number };
}

interface Category {
  id: string;
  title: string;
  slug: string;
}

type ModalMode = "closed" | "create" | "edit";

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const isAdmin = canMutateProducts(session?.user.role);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Guard: MARKETING role cannot access this page
  if (!isAdmin) return <AccessDenied />;

  // Form state
  const [form, setForm] = useState<{
    name: string; price: number; displayPrice: string; subtitle: string; description: string;
    styleCode: string; goldWeight: string; netWeight: string; diamondCount: string; diamondWeight: string;
    purity: string; bestseller: boolean; stock: number; isActive: boolean; categoryId: string;
    imageUrls: string[]; metalOptions: string; sizeOptions: string; finishOptions: string;
    customAttributes: { label: string; value: string }[];
  }>({
    name: "", price: 0, displayPrice: "", subtitle: "", description: "",
    styleCode: "", goldWeight: "", netWeight: "", diamondCount: "", diamondWeight: "",
    purity: "", bestseller: false, stock: 100, isActive: true, categoryId: "",
    imageUrls: [""], metalOptions: "", sizeOptions: "", finishOptions: "",
    customAttributes: [],
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?page=${page}&search=${search}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page, search]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) { setCategories(await res.json()); }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { loadCategories(); }, [loadCategories]);

  const openCreate = () => {
    setForm({
      name: "", price: 0, displayPrice: "", subtitle: "", description: "",
      styleCode: "", goldWeight: "", netWeight: "", diamondCount: "", diamondWeight: "",
      purity: "18K Gold", bestseller: false, stock: 100, isActive: true,
      categoryId: categories[0]?.id || "", imageUrls: [""], metalOptions: "14K Gold, 18K Gold, Silver, Rose Gold",
      sizeOptions: "6, 7, 8, 9, 10", finishOptions: "Glossy, Matte",
      customAttributes: [],
    });
    setEditProduct(null);
    setModalMode("create");
  };

  const openEdit = (product: Product) => {
    const metals = product.customizations.filter(c => c.type === "metal").map(c => c.value).join(", ");
    const sizes = product.customizations.filter(c => c.type === "size").map(c => c.value).join(", ");
    const finishes = product.customizations.filter(c => c.type === "finish").map(c => c.value).join(", ");

    setForm({
      name: product.name, price: product.price, displayPrice: product.displayPrice,
      subtitle: product.subtitle || "", description: product.description || "",
      styleCode: product.styleCode, goldWeight: product.goldWeight || "",
      netWeight: product.netWeight || "", diamondCount: product.diamondCount || "",
      diamondWeight: product.diamondWeight || "", purity: product.purity || "",
      bestseller: product.bestseller, stock: product.stock, isActive: product.isActive,
      categoryId: product.categoryId,
      imageUrls: product.images.length > 0 ? product.images.map(i => i.url) : [""],
      metalOptions: metals, sizeOptions: sizes, finishOptions: finishes,
      customAttributes: product.customAttributes ? (product.customAttributes as { label: string; value: string }[]) : [],
    });
    setEditProduct(product);
    setModalMode("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    const customizations = [
      ...form.metalOptions.split(",").map(v => v.trim()).filter(Boolean).map(v => ({ type: "metal", value: v })),
      ...form.sizeOptions.split(",").map(v => v.trim()).filter(Boolean).map(v => ({ type: "size", value: v })),
      ...form.finishOptions.split(",").map(v => v.trim()).filter(Boolean).map(v => ({ type: "finish", value: v })),
    ];

    const images = form.imageUrls.filter(u => u.trim()).map((url, i) => ({
      url: url.trim(), isHover: i === 1,
    }));

    const cleanCustomAttributes = form.customAttributes.filter(attr => attr.label.trim() && attr.value.trim());

    const body = {
      ...form, images, customizations, customAttributes: cleanCustomAttributes,
      imageUrls: undefined, metalOptions: undefined, sizeOptions: undefined, finishOptions: undefined,
    };

    try {
      const url = modalMode === "create" ? "/api/admin/products" : `/api/admin/products/${editProduct?.id}`;
      const method = modalMode === "create" ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (res.ok) {
        setModalMode("closed");
        setSuccessMsg(modalMode === "create" ? "Product created!" : "Product updated!");
        setTimeout(() => setSuccessMsg(""), 3000);
        loadProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } catch { alert("Network error"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"? This won't delete it permanently.`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadProducts();
  };

  const inputStyle = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[0.82rem] text-white outline-none focus:border-[#D4AF37]/50 transition-colors placeholder:text-white/20";
  const labelStyle = "block text-[0.62rem] uppercase tracking-[0.14em] text-white/40 mb-1.5";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-[1.3rem] font-brand uppercase tracking-[0.18em] text-white">Products</h1>
        <div className="flex items-center gap-3">
          <input
            type="text" placeholder="Search products..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[0.8rem] text-white outline-none focus:border-[#D4AF37]/40 w-[200px] placeholder:text-white/25"
          />
          <button onClick={openCreate}
            className="rounded-xl px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-black transition-all hover:shadow-[0_0_16px_rgba(212,175,55,0.3)]"
            style={{ background: "#D4AF37" }}>
            + Add Product
          </button>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="mb-4 rounded-xl px-4 py-3 text-[0.8rem] text-[#22c55e] border border-[#22c55e]/20 bg-[#22c55e]/5">
          ✓ {successMsg}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.78rem]">
            <thead>
              <tr className="border-b border-white/5">
                {["Product", "Category", "Price", "Stock", "Bestseller", "Status", "Orders", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/40 font-medium uppercase tracking-[0.1em] text-[0.6rem]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-white/30">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-white/30">No products found</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="border-b border-white/3 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images[0] && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                            <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="text-white/80 font-medium">{p.name}</p>
                          <p className="text-white/30 text-[0.65rem]">{p.styleCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/50">{p.category?.title}</td>
                    <td className="px-4 py-3 text-white/70 font-medium">{p.displayPrice}</td>
                    <td className="px-4 py-3">
                      <span style={{ color: p.stock < 10 ? "#ef4444" : p.stock < 30 ? "#D4AF37" : "#22c55e" }}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.bestseller ? <span className="text-[#D4AF37]">★</span> : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[0.6rem] uppercase tracking-[0.08em] px-2 py-1 rounded-full ${p.isActive ? "text-[#22c55e] bg-[#22c55e]/10" : "text-[#ef4444] bg-[#ef4444]/10"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40">{p._count.orderItems}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-[#D4AF37] hover:text-white text-[0.7rem] transition-colors">Edit</button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="text-red-400/60 hover:text-red-400 text-[0.7rem] transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-white/5">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 rounded-lg text-[0.7rem] text-white/40 hover:text-white disabled:opacity-30 border border-white/10">
              ← Prev
            </button>
            <span className="text-[0.7rem] text-white/30">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 rounded-lg text-[0.7rem] text-white/40 hover:text-white disabled:opacity-30 border border-white/10">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modalMode !== "closed" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-[680px] max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#141414] p-6 sm:p-8"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#D4AF37 transparent" }}>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[1rem] font-brand uppercase tracking-[0.16em] text-white">
                {modalMode === "create" ? "Add Product" : "Edit Product"}
              </h2>
              <button onClick={() => setModalMode("closed")} className="text-white/30 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelStyle}>Product Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputStyle} placeholder="Solitaire Diamond Ring" />
              </div>

              <div>
                <label className={labelStyle}>Price (paise) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} className={inputStyle} placeholder="2499900" />
              </div>

              <div>
                <label className={labelStyle}>Display Price</label>
                <input value={form.displayPrice} onChange={e => setForm(f => ({ ...f, displayPrice: e.target.value }))} className={inputStyle} placeholder="₹24,999" />
              </div>

              <div>
                <label className={labelStyle}>Style Code *</label>
                <input value={form.styleCode} onChange={e => setForm(f => ({ ...f, styleCode: e.target.value }))} className={inputStyle} placeholder="ALR16379" disabled={modalMode === "edit"} />
              </div>

              <div>
                <label className={labelStyle}>Category *</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#141414] px-3 py-2.5 text-[0.82rem] text-white outline-none focus:border-[#D4AF37]/50 transition-colors cursor-pointer"
                  style={{ appearance: "none", backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23D4AF37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: "right 0.75rem center", backgroundSize: "1.25em 1.25em", backgroundRepeat: "no-repeat", paddingRight: "2.2rem" }}>
                  <option value="" className="bg-[#141414] text-white">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id} className="bg-[#141414] text-white">{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className={labelStyle}>Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className={inputStyle} placeholder="IGI Certified" />
              </div>

              <div>
                <label className={labelStyle}>Purity</label>
                <input value={form.purity} onChange={e => setForm(f => ({ ...f, purity: e.target.value }))} className={inputStyle} placeholder="18K Gold" />
              </div>

              <div className="sm:col-span-2">
                <label className={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={inputStyle} rows={2} placeholder="Product description..." />
              </div>

              <div><label className={labelStyle}>Gold Weight</label><input value={form.goldWeight} onChange={e => setForm(f => ({ ...f, goldWeight: e.target.value }))} className={inputStyle} placeholder="1.649 g" /></div>
              <div><label className={labelStyle}>Net Weight</label><input value={form.netWeight} onChange={e => setForm(f => ({ ...f, netWeight: e.target.value }))} className={inputStyle} placeholder="2.000 g" /></div>
              <div><label className={labelStyle}>Diamond Count</label><input value={form.diamondCount} onChange={e => setForm(f => ({ ...f, diamondCount: e.target.value }))} className={inputStyle} placeholder="30" /></div>
              <div><label className={labelStyle}>Diamond Weight</label><input value={form.diamondWeight} onChange={e => setForm(f => ({ ...f, diamondWeight: e.target.value }))} className={inputStyle} placeholder="0.244 ct" /></div>
              <div><label className={labelStyle}>Stock</label><input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} className={inputStyle} /></div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.bestseller} onChange={e => setForm(f => ({ ...f, bestseller: e.target.checked }))}
                    className="accent-[#D4AF37] w-4 h-4" />
                  <span className="text-[0.72rem] text-white/60">Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="accent-[#22c55e] w-4 h-4" />
                  <span className="text-[0.72rem] text-white/60">Active</span>
                </label>
              </div>

              {/* Images */}
              <div className="sm:col-span-2">
                <label className={labelStyle}>Image URLs (one per line)</label>
                {form.imageUrls.map((url, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={url} onChange={e => {
                      const urls = [...form.imageUrls]; urls[i] = e.target.value;
                      setForm(f => ({ ...f, imageUrls: urls }));
                    }} className={inputStyle} placeholder="/products/ring-1.jpg" />
                    {form.imageUrls.length > 1 && (
                      <button onClick={() => {
                        const urls = form.imageUrls.filter((_, j) => j !== i);
                        setForm(f => ({ ...f, imageUrls: urls }));
                      }} className="text-red-400/60 hover:text-red-400 px-2">✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setForm(f => ({ ...f, imageUrls: [...f.imageUrls, ""] }))}
                  className="text-[#D4AF37] text-[0.7rem] hover:text-white transition-colors">+ Add image</button>
              </div>

              {/* Customizations */}
              <div className="sm:col-span-2">
                <label className={labelStyle}>Metal Options (comma separated)</label>
                <input value={form.metalOptions} onChange={e => setForm(f => ({ ...f, metalOptions: e.target.value }))} className={inputStyle} placeholder="14K Gold, 18K Gold, Silver, Rose Gold" />
              </div>
              <div>
                <label className={labelStyle}>Size Options (comma separated)</label>
                <input value={form.sizeOptions} onChange={e => setForm(f => ({ ...f, sizeOptions: e.target.value }))} className={inputStyle} placeholder="6, 7, 8, 9, 10" />
              </div>
              <div>
                <label className={labelStyle}>Finish Options (comma separated)</label>
                <input value={form.finishOptions} onChange={e => setForm(f => ({ ...f, finishOptions: e.target.value }))} className={inputStyle} placeholder="Glossy, Matte" />
              </div>

              {/* Custom Specifications */}
              <div className="sm:col-span-2 mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[0.68rem] uppercase tracking-[0.14em] text-[#D4AF37] font-semibold">Custom Specifications</label>
                  <button type="button" onClick={() => setForm(f => ({ ...f, customAttributes: [...f.customAttributes, { label: "", value: "" }] }))}
                    className="text-[#D4AF37] text-[0.7rem] hover:text-white transition-colors border border-[#D4AF37]/30 px-3 py-1 rounded-lg hover:border-[#D4AF37]">+ Add Specification</button>
                </div>
                {form.customAttributes.length === 0 ? (
                  <p className="text-[0.7rem] text-white/30 italic">No custom specifications added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {form.customAttributes.map((attr, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="flex-1">
                          <input value={attr.label} onChange={e => {
                            const newAttrs = [...form.customAttributes];
                            newAttrs[idx] = { ...newAttrs[idx], label: e.target.value };
                            setForm(f => ({ ...f, customAttributes: newAttrs }));
                          }} className={inputStyle} placeholder="Label (e.g. Origin)" />
                        </div>
                        <div className="flex-1">
                          <input value={attr.value} onChange={e => {
                            const newAttrs = [...form.customAttributes];
                            newAttrs[idx] = { ...newAttrs[idx], value: e.target.value };
                            setForm(f => ({ ...f, customAttributes: newAttrs }));
                          }} className={inputStyle} placeholder="Value (e.g. Sri Lanka)" />
                        </div>
                        <button type="button" onClick={() => {
                          const newAttrs = form.customAttributes.filter((_, j) => j !== idx);
                          setForm(f => ({ ...f, customAttributes: newAttrs }));
                        }} className="text-red-400/60 hover:text-red-400 px-2 text-lg">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
              <button onClick={() => setModalMode("closed")}
                className="px-4 py-2 rounded-lg text-[0.72rem] text-white/40 hover:text-white border border-white/10 uppercase tracking-[0.1em]">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 rounded-lg text-[0.72rem] font-semibold text-black uppercase tracking-[0.1em] disabled:opacity-50"
                style={{ background: "#D4AF37" }}>
                {saving ? "Saving..." : modalMode === "create" ? "Create Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
