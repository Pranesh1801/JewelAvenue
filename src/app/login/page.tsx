"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { DiamondMark } from "@/components/home/DiamondMark";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Validate callbackUrl: only allow same-origin relative paths.
  // This prevents open-redirect attacks AND stops stale Vercel URLs
  // from leaking through when NEXTAUTH_URL is misconfigured.
  const rawCallback = searchParams.get("callbackUrl") || "/";
  const callbackUrl = rawCallback.startsWith("/") ? rawCallback : "/";

  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(error ? "Invalid credentials" : "");

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const result = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setErrorMsg("Invalid email or password");
      setLoading(false);
    } else if (result?.url) {
      // Extract only the pathname+search from result.url to prevent
      // stale absolute URLs (e.g. https://jewelavenue.vercel.app/...)
      // from redirecting the browser off the current origin.
      try {
        const parsed = new URL(result.url);
        router.push(parsed.pathname + parsed.search);
      } catch {
        router.push(callbackUrl);
      }
    }
  };

  const handleGoogle = () => {
    signIn("google", { callbackUrl });
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
            Sign in to your account
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
          {/* Error */}
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

          {/* Credentials form */}
          <form onSubmit={handleCredentials} className="flex flex-col gap-4">
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
                className="w-full rounded-xl border px-4 py-3 text-[0.85rem] outline-none transition-all hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.15)]"
                style={{
                  borderColor: "rgba(212,175,55,0.25)",
                  background: "#fff",
                  fontFamily: "var(--font-ui), Arial, sans-serif",
                }}
              />
            </div>

            <div>
              <label className="block text-[0.68rem] uppercase tracking-[0.14em] text-gray-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-white border border-[#D4AF37]/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] disabled:opacity-50 hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] cursor-pointer"
              style={{ background: "#0a0a0a" }}
            >
              {loading ? "Signing in..." : "Sign In"}
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
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-full border py-3 text-[0.78rem] font-medium tracking-[0.08em] transition-all duration-300 hover:shadow-[0_0_16px_rgba(0,0,0,0.06)]"
            style={{
              borderColor: "rgba(0,0,0,0.1)",
              background: "#fff",
              color: "#333",
            }}
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

        {/* Register link */}
        <p className="mt-6 text-center text-[0.78rem] text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold transition-colors hover:text-[#D4AF37]/80"
            style={{ color: "#D4AF37" }}
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-white">
          <DiamondMark size={48} />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
