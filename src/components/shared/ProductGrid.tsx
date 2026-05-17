"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Product } from "../../data/types";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductModal } from "@/components/shared/ProductModal";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3 lg:gap-8">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onClick={() => setActiveProduct(product)}
          />
        ))}
      </div>

      <AnimatePresence>
        {activeProduct ? (
          <ProductModal
            product={activeProduct}
            onClose={() => setActiveProduct(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
