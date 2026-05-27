"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { DiamondMark } from "@/components/home/DiamondMark";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenError("No reset token found. Please request a new link.");
      setValidating(false);
      return;
    }

    fetch(`/api/auth/reset-password?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setTokenValid(true);
        } else {
          setTokenError(data.error ?? "Invalid or expired link.");
        }
      })
      .catch(() => setTokenError("Could not validate link. Please try again."))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login?reset=true"), 2500);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }: { open: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

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
            Reset Password
          </p>
        </div>

        <div
          className="rounded-[20px] p-7 sm:p-8"
          style={{
            background: "#FDFAF4",
            border: "1px solid rgba(212,175,55,0.2)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
          }}
        >
          {/* Validating token */}
          {validating && (
            <div className="flex flex-col items-center py-8 gap-4">
              <DiamondMark size={32} />
              <p className="text-[0.82rem] text-gray-400 uppercase tracking-[0.14em]">
                Validating link...
              </p>
            </div>
          )}

          {/* Token invalid */}
          {!validating && !tokenValid && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(220,38,38,0.08)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="text-[1rem] font-semibold text-[#0a0a0a] mb-2">Link invalid</h2>
              <p className="text-[0.82rem] text-gray-500 mb-6">{tokenError}</p>
              <Link
                href="/forgot-password"
                className="text-[0.82rem] font-semibold"
                style={{ color: "#D4AF37" }}
              >
                Request a new link →
              </Link>
            </motion.div>
          )}

          {/* Success */}
          {!validating && success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(212,175,55,0.12)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-[1rem] font-semibold text-[#0a0a0a] mb-2">
                Password updated!
              </h2>
              <p className="text-[0.82rem] text-gray-500">
                Redirecting you to sign in...
              </p>
            </motion.div>
          )}

          {/* Reset form */}
          {!validating && tokenValid && !success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-[1rem] font-semibold text-[#0a0a0a] mb-1">
                Choose a new password
              </h2>
              <p className="text-[0.82rem] text-gray-500 mb-6">
                Must be at least 8 characters.
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
                {/* New password */}
                <div>
                  <label className="block text-[0.68rem] uppercase tracking-[0.14em] text-gray-500 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      className="w-full rounded-xl border px-4 py-3 pr-11 text-[0.85rem] outline-none transition-all hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.15)]"
                      style={{
                        borderColor: "rgba(212,175,55,0.25)",
                        background: "#fff",
                        fontFamily: "var(--font-ui), Arial, sans-serif",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-[0.68rem] uppercase tracking-[0.14em] text-gray-500 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full rounded-xl border px-4 py-3 pr-11 text-[0.85rem] outline-none transition-all hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.15)]"
                      style={{
                        borderColor: "rgba(212,175,55,0.25)",
                        background: "#fff",
                        fontFamily: "var(--font-ui), Arial, sans-serif",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-full py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-white border border-[#D4AF37]/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] disabled:opacity-50 hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] cursor-pointer"
                  style={{ background: "#0a0a0a" }}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </motion.div>
          )}
        </div>

        {!success && (
          <p className="mt-6 text-center text-[0.78rem] text-gray-500">
            <Link
              href="/login"
              className="font-semibold transition-colors hover:text-[#D4AF37]/80"
              style={{ color: "#D4AF37" }}
            >
              ← Back to Sign In
            </Link>
          </p>
        )}
      </motion.div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-white">
          <DiamondMark size={48} />
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
