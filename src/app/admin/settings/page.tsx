"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AccessDenied } from "@/components/admin/AccessDenied";

interface StoreSettings {
  heroVideoUrl: string;
  giftingTitle: string;
  giftingTagline: string;
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();

  // Guard: only ADMIN may manage store settings
  if (!session || session.user.role !== "ADMIN") return <AccessDenied />;

  const [settings, setSettings] = useState<StoreSettings>({
    heroVideoUrl: "",
    giftingTitle: "",
    giftingTagline: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch((err) => console.error("Error loading settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccessMsg("Settings successfully saved to Shopify database! 🎉");
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to save settings.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[0.82rem] text-white outline-none focus:border-[#D4AF37]/50 placeholder:text-white/20 transition-colors";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/30 text-sm">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-[1.3rem] font-brand uppercase tracking-[0.18em] text-white">Store Layout Settings</h1>
        <p className="text-white/40 text-xs mt-1">Manage global website sections, hero media, and promotion copy directly saved to Shopify.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-white/5 p-6 bg-white/[0.01]">
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {/* Hero Video section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D4AF37] mb-2">✦ Hero Banner Settings</h3>
            <label className="block text-[0.62rem] uppercase tracking-[0.14em] text-white/40 mb-1">Hero Video URL</label>
            <input
              type="text"
              value={settings.heroVideoUrl}
              onChange={(e) => setSettings((s) => ({ ...s, heroVideoUrl: e.target.value }))}
              placeholder="e.g. /HomeIntro.mp4 or external link"
              className={inputStyle}
              required
            />
            <p className="text-[0.6rem] text-white/20 mt-1">Provide a local video path or a direct link to an MP4 video hosted on Shopify files.</p>
          </div>

          <hr className="border-white/5 my-4" />

          {/* Gifting Section config */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D4AF37] mb-2">✦ Gifting Box Settings</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[0.62rem] uppercase tracking-[0.14em] text-white/40 mb-1">Gifting Box Title</label>
                <input
                  type="text"
                  value={settings.giftingTitle}
                  onChange={(e) => setSettings((s) => ({ ...s, giftingTitle: e.target.value }))}
                  placeholder="e.g. Unforgettable Gifting"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="block text-[0.62rem] uppercase tracking-[0.14em] text-white/40 mb-1">Gifting Box Tagline</label>
                <textarea
                  value={settings.giftingTagline}
                  onChange={(e) => setSettings((s) => ({ ...s, giftingTagline: e.target.value }))}
                  placeholder="Tagline description..."
                  className={`${inputStyle} h-20 resize-none`}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-[0.72rem] font-semibold text-black uppercase tracking-[0.1em] disabled:opacity-50 transition-opacity"
            style={{ background: "#D4AF37" }}
          >
            {saving ? "Saving Settings..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
