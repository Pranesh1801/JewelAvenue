"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Maps category slugs/names to their collection images from /public
const CATEGORY_IMAGES: Record<string, string> = {
  rings: "/Ring_Collections.jpeg",
  ring: "/Ring_Collections.jpeg",
  earrings: "/jhumkas2_Collections.jpeg",
  earring: "/jhumkas2_Collections.jpeg",
  bracelets: "/Bracelet_Collections.jpeg",
  bracelet: "/Bracelet_Collections.jpeg",
  jhumkas: "/Jhumkas_Collections.jpeg",
  jhumka: "/Jhumkas_Collections.jpeg",
  pendants: "/Pendant_Collections.jpeg",
  pendant: "/Pendant_Collections.jpeg",
  bangles: "/Bangles_Collections.jpeg",
  bangle: "/Bangles_Collections.jpeg",
};

function getCategoryImage(slug: string, title: string): string {
  const key = slug.toLowerCase();
  if (CATEGORY_IMAGES[key]) return CATEGORY_IMAGES[key];
  const titleKey = title.toLowerCase().split(" ")[0];
  if (CATEGORY_IMAGES[titleKey]) return CATEGORY_IMAGES[titleKey];
  return "/Ring_Collections.jpeg"; // fallback
}

interface Category {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  href?: string | null;
  imageUrl?: string | null;
}

export function ShopByCategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.ok ? r.json() : [])
      .then((data: Category[]) => {
        // Filter out Shopify's default/non-jewelry collections
        const filtered = data.filter(c =>
          !["automated-collection", "home-page", "frontpage", "hydrogen", "oxygen", "liquid"].includes(c.slug)
        );
        setCategories(filtered);
      })
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="w-full flex justify-center px-3 sm:px-4 mt-10 mb-4">
      <div className="w-[min(1180px,calc(100vw-1.5rem))]">
        {/* Section header */}
        <h2 className="text-center text-[1.2rem] tracking-[0.4em] uppercase font-ui mb-8 text-black">
          Shop by Category
        </h2>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-3 overflow-x-auto pb-3 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible md:grid-cols-4 scrollbar-hide">
          {categories.map((cat, i) => {
            const img = cat.imageUrl || getCategoryImage(cat.slug, cat.title);
            const href = cat.href || `/collections/${cat.slug}`;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="flex-shrink-0 w-[160px] sm:w-auto"
              >
                <Link href={href} className="group block">
                  <div
                    className="relative overflow-hidden rounded-[16px]"
                    style={{
                      aspectRatio: "3/4",
                      boxShadow: "0 4px 18px rgba(0,0,0,0.14)",
                    }}
                  >
                    {/* Image */}
                    <img
                      src={img}
                      alt={cat.title}
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.06]"
                    />

                    {/* Dark gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
                      }}
                    />

                    {/* Gold border on hover */}
                    <div
                      className="absolute inset-0 rounded-[16px] border-2 border-transparent group-hover:border-[#D4AF37]/60 transition-colors duration-300"
                    />

                    {/* Category label chip */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4">
                      <span
                        className="px-3 py-1 rounded-full text-[0.6rem] font-ui font-semibold uppercase tracking-[0.22em] text-white"
                        style={{
                          background: "rgba(0,0,0,0.55)",
                          backdropFilter: "blur(6px)",
                          border: "1px solid rgba(212,175,55,0.35)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        }}
                      >
                        {cat.title}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
