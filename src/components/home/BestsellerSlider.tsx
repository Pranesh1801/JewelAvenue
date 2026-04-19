"use client";

import { useEffect, useRef, useState } from "react";

const ITEMS = 6;

export function BestsellerSlider() {
  const [index, setIndex] = useState(ITEMS);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const items = [...Array(ITEMS), ...Array(ITEMS), ...Array(ITEMS)];

  // AUTO SLIDE
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // ✅ RIGHT SIDE RESET (already had)
  useEffect(() => {
    if (index >= ITEMS * 2) {
      const t = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(ITEMS);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [index]);

  // ✅ LEFT SIDE RESET (THIS WAS MISSING → YOUR BUG)
  useEffect(() => {
    if (index < ITEMS) {
      const t = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(ITEMS * 2 - 1);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [index]);

  // RE-ENABLE TRANSITION
  useEffect(() => {
    if (!isTransitioning) {
      const t = setTimeout(() => setIsTransitioning(true), 50);
      return () => clearTimeout(t);
    }
  }, [isTransitioning]);

  const next = () => setIndex((prev) => prev + 1);
  const prev = () => setIndex((prev) => prev - 1);

  return (
    <section className="w-full flex justify-center px-3 sm:px-4 mt-10">
      <div className="w-[min(1180px,calc(100vw-1.5rem))]">

        <h2 className="text-center text-[1.2rem] tracking-[0.4em] uppercase font-ui mb-6 text-black">
          Best Sellers
        </h2>

        <div className="relative overflow-hidden w-full">

          <div
            ref={containerRef}
            className="flex"
            style={{
              transform: `translateX(-${index * 25}%)`,
              transition: isTransitioning
                ? "transform 700ms cubic-bezier(0.22,1,0.36,1)"
                : "none",
            }}
          >
            {items.map((_, i) => (
              <div key={i} className="min-w-[25%] px-2">
                <div
                  className="rounded-[18px] p-[1px]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                  }}
                >
                  <div className="bg-white rounded-[16px] overflow-hidden">

                    <div
                      className="m-2 rounded-[14px] overflow-hidden"
                      style={{
                        border: "1.5px solid #D4AF37",
                        boxShadow: "0 0 10px rgba(212,175,55,0.35)",
                      }}
                    >
                      <div className="h-[240px] bg-gray-200" />
                    </div>

                    <div className="p-3 text-center">
                      <p className="text-[0.85rem] font-ui">
                        Product Name
                      </p>
                      <p className="text-[0.75rem] text-gray-500">
                        ₹ 2,999
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* LEFT */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center"
          >
            ‹
          </button>

          {/* RIGHT */}
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center"
          >
            ›
          </button>

        </div>
      </div>
    </section>
  );
}