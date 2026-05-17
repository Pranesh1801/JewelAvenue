"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { Product } from "../../data/types";
import { getProductImage, getProductHoverImage } from "@/utils/productImageHelper";
import { BestsellerBadge } from "@/components/ui/BestsellerBadge";

type ProductCardProps = {
  product: Product;
  index?: number;
  onClick?: () => void;
};

export function ProductCard({
  product,
  index = 0,
  onClick,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showHover, setShowHover] = useState(false);
  const subtitle = product.subtitle || product.description;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ once: true, margin: "-100px" }}
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowHover(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowHover(false);
      }}
      className="group flex flex-col text-left focus:outline-none"
    >
      {/* Outer black frame */}
      <div
        className="relative flex flex-col rounded-[18px] p-[1px] overflow-hidden transition-all duration-400"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))",
          boxShadow: isHovered
            ? "0 12px 36px rgba(0,0,0,0.35), 0 0 30px rgba(212,175,55,0.35)"
            : "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {/* Inner white card */}
        <div className="bg-white rounded-[16px] overflow-hidden flex flex-col h-full">
          {/* Image container with gold border */}
          <div className="relative m-1.5 sm:m-3 rounded-[10px] sm:rounded-[12px] overflow-hidden" style={{ aspectRatio: "4 / 5" }}>
            {product.bestseller && <BestsellerBadge />}
            <div
              className="absolute inset-0 rounded-[12px] transition-all duration-300"
              style={{
                border: "2px solid #D4AF37",
                boxShadow: isHovered
                  ? "0 0 20px rgba(212,175,55,0.5), inset 0 0 12px rgba(212,175,55,0.25)"
                  : "0 0 12px rgba(212,175,55,0.3), inset 0 0 8px rgba(212,175,55,0.15)",
              }}
            />

            {/* Image with hover swap */}
            <div className="relative w-full h-full overflow-hidden bg-gray-100">
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: showHover ? 0 : 1, scale: showHover ? 1.05 : 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <SafeImage
                  src={getProductImage(product)}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </motion.div>

              <motion.div
                className="absolute inset-0"
                animate={{ opacity: showHover ? 1 : 0, scale: showHover ? 1 : 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <SafeImage
                  src={getProductHoverImage(product)}
                  alt={`${product.name} close-up`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </motion.div>
            </div>
          </div>

          {/* Product info */}
          <div className="px-2 pb-2 sm:px-4 sm:pb-4 text-center">
            <h3 className="text-[0.7rem] sm:text-[0.9rem] font-ui font-medium text-black mb-0.5 sm:mb-1 line-clamp-2 leading-snug">
              {product.name}
            </h3>
            <p className="text-[0.65rem] sm:text-[0.8rem] font-ui text-gray-600 mb-0.5 sm:mb-1">
              {product.price}
            </p>
            {subtitle && (
              <p className="text-[0.58rem] sm:text-[0.7rem] font-ui text-gray-500 line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}