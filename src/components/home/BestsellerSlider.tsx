"use client";

import { useEffect, useRef, useState } from "react";
import SafeImage from "@/components/shared/SafeImage";
import { AnimatePresence } from "framer-motion";
import { bestsellerProducts } from "@/data/allProducts";
import { getProductImage } from "@/utils/productImageHelper";
import { BestsellerBadge } from "@/components/ui/BestsellerBadge";
import { ProductModal } from "@/components/shared/ProductModal";
import { Product } from "@/data/types";

const items = bestsellerProducts;
const ITEMS = items.length;

// Returns how many cards are visible at once based on viewport width.
// 1 on mobile (<640), 2 on tablet (<1024), 4 on desktop.
function useVisibleCount() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCount(w < 640 ? 1 : w < 1024 ? 2 : 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
}

function EmptyState() {
  return (
    <section className="w-full flex justify-center px-3 sm:px-4 mt-10">
      <div className="w-[min(1180px,calc(100vw-1.5rem))] text-center py-12">
        <h2 className="text-center text-[1.2rem] tracking-[0.4em] uppercase font-ui mb-4 text-black">
          Best Sellers
        </h2>
        <p className="text-[0.82rem] font-ui text-gray-400 tracking-[0.18em] uppercase">
          Curated icons arriving soon.
        </p>
      </div>
    </section>
  );
}

export function BestsellerSlider() {
  const visibleCount = useVisibleCount();
  const [index, setIndex] = useState(ITEMS);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (ITEMS === 0) return <EmptyState />;

  const tripled = [...items, ...items, ...items];
  // Card width as a percentage of the track — derived from visibleCount
  const cardPct = 100 / visibleCount;

  return (
    <>
      <SliderInner
        tripled={tripled}
        index={index}
        setIndex={setIndex}
        isTransitioning={isTransitioning}
        setIsTransitioning={setIsTransitioning}
        containerRef={containerRef}
        onCardClick={setActiveProduct}
        cardPct={cardPct}
        visibleCount={visibleCount}
      />

      <AnimatePresence>
        {activeProduct && (
          <ProductModal
            product={activeProduct}
            onClose={() => setActiveProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function SliderInner({
  tripled,
  index,
  setIndex,
  isTransitioning,
  setIsTransitioning,
  containerRef,
  onCardClick,
  cardPct,
  visibleCount,
}: {
  tripled: typeof bestsellerProducts;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  isTransitioning: boolean;
  setIsTransitioning: React.Dispatch<React.SetStateAction<boolean>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCardClick: (product: Product) => void;
  cardPct: number;
  visibleCount: number;
}) {
  const pointerDownX = useRef<number>(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((p) => p + 1), 5000);
    return () => clearInterval(id);
  }, [setIndex]);

  useEffect(() => {
    if (index >= ITEMS * 2) {
      const t = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(ITEMS);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [index, setIndex, setIsTransitioning]);

  useEffect(() => {
    if (index < ITEMS) {
      const t = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(ITEMS * 2 - 1);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [index, setIndex, setIsTransitioning]);

  useEffect(() => {
    if (!isTransitioning) {
      const t = setTimeout(() => setIsTransitioning(true), 50);
      return () => clearTimeout(t);
    }
  }, [isTransitioning, setIsTransitioning]);

  const next = () => setIndex((p) => p + 1);
  const prev = () => setIndex((p) => p - 1);

  // Active dot: which original item is currently centred
  const activeDot = ((index - ITEMS) % ITEMS + ITEMS) % ITEMS;

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
              // Offset is now derived from cardPct, not hardcoded 25%
              transform: `translateX(-${index * cardPct}%)`,
              transition: isTransitioning
                ? "transform 700ms cubic-bezier(0.22,1,0.36,1)"
                : "none",
            }}
          >
            {tripled.map((product, i) => (
              // flex-shrink-0 prevents cards from collapsing; width derived from visibleCount
              <div
                key={i}
                className="flex-shrink-0 px-2"
                style={{ width: `${cardPct}%` }}
              >
                <button
                  type="button"
                  className="w-full text-left focus:outline-none group"
                  onPointerDown={(e) => { pointerDownX.current = e.clientX; }}
                  onClick={(e) => {
                    if (Math.abs(e.clientX - pointerDownX.current) > 6) return;
                    onCardClick(product);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="rounded-[18px] p-[1px] transition-all duration-300"
                    style={{
                      background: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 12px 32px rgba(0,0,0,0.32), 0 0 24px rgba(212,175,55,0.28)";
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 6px 18px rgba(0,0,0,0.25)";
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div className="bg-white rounded-[16px] overflow-hidden flex flex-col">

                      {/* Image frame — aspect-square instead of fixed 240px height */}
                      <div
                        className="relative mx-2 mt-2 rounded-[14px] overflow-hidden aspect-square flex-shrink-0"
                        style={{
                          border: "1.5px solid #D4AF37",
                          boxShadow: "0 0 10px rgba(212,175,55,0.35)",
                        }}
                      >
                        {/* Badge: absolute inside the image frame, always fully visible */}
                        <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10 }}>
                          <BestsellerBadge variant="placed" />
                        </div>
                        <SafeImage
                          src={getProductImage(product)}
                          alt={product.name}
                          fill
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                          // sizes reflects actual rendered width at each breakpoint
                          sizes={
                            visibleCount === 1
                              ? "calc(100vw - 1.5rem)"
                              : visibleCount === 2
                              ? "calc(50vw - 1.5rem)"
                              : "calc(25vw - 1.5rem)"
                          }
                        />
                      </div>

                      {/* Info section */}
                      <div
                        className="flex flex-col items-center justify-center text-center px-3 flex-shrink-0"
                        style={{ height: 72 }}
                      >
                        <p className="text-[0.85rem] font-ui font-medium text-black w-full truncate">
                          {product.name}
                        </p>
                        {product.category && (
                          <p className="text-[0.68rem] font-ui text-gray-400 uppercase tracking-[0.14em]">
                            {product.category}
                          </p>
                        )}
                        <p className="text-[0.75rem] text-gray-500">
                          {product.price}
                        </p>
                      </div>

                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center z-10"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center z-10"
            aria-label="Next"
          >
            ›
          </button>
        </div>

        {/* Dot indicators — only on mobile (1 card visible) */}
        {visibleCount === 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(ITEMS + i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: activeDot === i ? 18 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: activeDot === i ? "#D4AF37" : "rgba(0,0,0,0.18)",
                  border: "none",
                  cursor: "pointer",
                  transition: "width 0.3s ease, background 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
