"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { DiamondMark } from "@/components/home/DiamondMark";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    missing: "No verification token was found in the link.",
    invalid: "This verification link is invalid.",
    expired: "This verification link has expired. Please register again.",
  };

  const errorText = error ? (errorMessages[error] ?? "Verification failed.") : null;

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
            Email Verification
          </p>
        </div>

        <div
          className="rounded-[20px] p-7 sm:p-8 text-center"
          style={{
            background: "#FDFAF4",
            border: "1px solid rgba(212,175,55,0.2)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
          }}
        >
          {errorText ? (
            /* Error state */
            <>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(220,38,38,0.08)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="text-[1rem] font-semibold text-[#0a0a0a] mb-3">
                Verification failed
              </h2>
              <p className="text-[0.82rem] text-gray-500 mb-6">{errorText}</p>
              <Link
                href="/register"
                className="text-[0.82rem] font-semibold"
                style={{ color: "#D4AF37" }}
              >
                Create a new account →
              </Link>
            </>
          ) : (
            /* Pending state — email not yet clicked */
            <>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(212,175,55,0.12)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="text-[1rem] font-semibold text-[#0a0a0a] mb-3">
                Check your email
              </h2>
              <p className="text-[0.82rem] text-gray-500 leading-relaxed mb-4">
                We&apos;ve sent a verification link to your email address.
                Click the link to activate your account.
              </p>
              <p className="text-[0.75rem] text-gray-400">
                Link expires in 24 hours. Check your spam folder if you
                don&apos;t see it.
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-[0.78rem] text-gray-500">
          <Link
            href="/login"
            className="font-semibold transition-colors hover:text-[#D4AF37]/80"
            style={{ color: "#D4AF37" }}
          >
            ← Back to Sign In
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-white">
          <DiamondMark size={48} />
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
