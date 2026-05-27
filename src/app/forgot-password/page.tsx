"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DiamondMark } from "@/components/home/DiamondMark";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <DiamondMark size={48} />
          <h1
            className="mt-3 font-balgin uppercase tracking-[0.28em] text-[1.1rem]"
            style={{ color: "#0a0a0a" }}
          >
            Jewel Avenue
          </h1>
          <p className="mt-1 text-[0.75rem] text-gray-400 tracking-[0.14em] uppercase">
            Password Recovery
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-[20px] p-7 sm:p-8"
          style={{
            background: "#FDFAF4",
            border: "1px solid rgba(212,175,55,0.2)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
          }}
        >
          {submitted ? (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-4"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(212,175,55,0.12)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="text-[1rem] font-semibold text-[#0a0a0a] mb-2">
                Check your inbox
              </h2>
              <p className="text-[0.82rem] text-gray-500 leading-relaxed mb-6">
                If an account exists for <strong>{email}</strong>, a password
                reset link has been sent. Check your spam folder if you
                don&apos;t see it.
              </p>
              <p className="text-[0.75rem] text-gray-400">
                Link expires in 30 minutes.
              </p>
            </motion.div>
          ) : (
            <>
              <h2 className="text-[1rem] font-semibold text-[#0a0a0a] mb-1">
                Forgot your password?
              </h2>
              <p className="text-[0.82rem] text-gray-500 mb-6 leading-relaxed">
                Enter your email and we&apos;ll send you a secure link to reset
                your password.
              </p>

              {error && (
                <div
                  className="mb-5 rounded-xl px-4 py-3 text-[0.8rem]"
                  style={{
                    background: "rgba(220,38,38,0.06)",
                    border: "1px solid rgba(220,38,38,0.2)",
                    color: "#b91c1c",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[0.68rem] uppercase tracking-[0.14em] text-gray-500 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full rounded-xl border px-4 py-3 text-[0.85rem] outline-none transition-all hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.15)]"
                    style={{
                      borderColor: "rgba(212,175,55,0.25)",
                      background: "#fff",
                      fontFamily: "var(--font-ui), Arial, sans-serif",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-full py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-white border border-[#D4AF37]/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] disabled:opacity-50 hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] cursor-pointer"
                  style={{ background: "#0a0a0a" }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-[0.78rem] text-gray-500">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold transition-colors hover:text-[#D4AF37]/80"
            style={{ color: "#D4AF37" }}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
