"use client";

import { motion } from "framer-motion";

interface AccessDeniedProps {
  /** Optional description of what action was denied */
  action?: string;
}

/**
 * AccessDenied — themed alert shown when a MARKETING user tries to access
 * a restricted section. Uses existing Jewel Avenue admin styling.
 * Does NOT expose technical details (role names, route names, etc.).
 */
export function AccessDenied({ action }: AccessDeniedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: "rgba(212,175,55,0.08)",
          border: "1px solid rgba(212,175,55,0.2)",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(212,175,55,0.7)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      {/* Title */}
      <h2
        className="text-[1.1rem] font-brand uppercase tracking-[0.2em] mb-3"
        style={{ color: "rgba(255,255,255,0.85)" }}
      >
        Access Denied
      </h2>

      {/* Message */}
      <p
        className="text-[0.82rem] leading-relaxed max-w-[320px]"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {action
          ? `You do not have permission to ${action}.`
          : "You do not have permission to perform this operation."}
      </p>

      {/* Decorative line */}
      <div
        className="mt-8 w-12 h-px"
        style={{ background: "rgba(212,175,55,0.2)" }}
      />
      <p
        className="mt-4 text-[0.65rem] uppercase tracking-[0.18em]"
        style={{ color: "rgba(255,255,255,0.15)" }}
      >
        Contact your administrator for access
      </p>
    </motion.div>
  );
}
