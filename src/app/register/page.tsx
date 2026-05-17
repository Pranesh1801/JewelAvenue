"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DiamondMark } from "@/components/home/DiamondMark";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
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
            Create your account
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
          {errorMsg && (
            <div
              className="mb-5 rounded-xl px-4 py-3 text-[0.8rem]"
              style={{
                background: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.2)",
                color: "#b91c1c",
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.68rem] uppercase tracking-[0.14em] text-gray-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full rounded-xl border px-4 py-3 text-[0.85rem] outline-none transition-all focus:border-[#D4AF37] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                style={{ borderColor: "rgba(212,175,55,0.3)", background: "#fff", fontFamily: "var(--font-ui)" }}
              />
            </div>

            <div>
              <label className="block text-[0.68rem] uppercase tracking-[0.14em] text-gray-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-xl border px-4 py-3 text-[0.85rem] outline-none transition-all focus:border-[#D4AF37] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                style={{ borderColor: "rgba(212,175,55,0.3)", background: "#fff", fontFamily: "var(--font-ui)" }}
              />
            </div>

            <div>
              <label className="block text-[0.68rem] uppercase tracking-[0.14em] text-gray-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
                className="w-full rounded-xl border px-4 py-3 text-[0.85rem] outline-none transition-all focus:border-[#D4AF37] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                style={{ borderColor: "rgba(212,175,55,0.3)", background: "#fff", fontFamily: "var(--font-ui)" }}
              />
            </div>

            <div>
              <label className="block text-[0.68rem] uppercase tracking-[0.14em] text-gray-500 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full rounded-xl border px-4 py-3 text-[0.85rem] outline-none transition-all focus:border-[#D4AF37] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                style={{ borderColor: "rgba(212,175,55,0.3)", background: "#fff", fontFamily: "var(--font-ui)" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(4,99,7,0.3)] disabled:opacity-50"
              style={{ background: "#046307" }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.2)" }} />
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-gray-400">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.2)" }} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 rounded-full border py-3 text-[0.78rem] font-medium tracking-[0.08em] transition-all duration-300 hover:shadow-[0_0_16px_rgba(0,0,0,0.06)]"
            style={{ borderColor: "rgba(0,0,0,0.1)", background: "#fff", color: "#333" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-[0.78rem] text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold transition-colors hover:text-[#D4AF37]"
            style={{ color: "#046307" }}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
