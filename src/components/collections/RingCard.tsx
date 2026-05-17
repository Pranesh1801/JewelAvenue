"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { getProductImage, getProductHoverImage } from "@/utils/productImageHelper";

type RingCardProps = {
  id: string;
  name: string;
  price: string;
  image: string;
  hoverImage: string;
  description?: string;
  index: number;
};

export function RingCard({
  id,
  name,
  price,
  image,
  hoverImage,
  description,
  index,
}: RingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showHover, setShowHover] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ once: true, margin: "-100px" }}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowHover(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowHover(false);
      }}
      className="group flex flex-col"
    >
      {/* Outer black frame */}
      <div
        className="relative flex flex-col rounded-[18px] p-[1px] overflow-hidden transition-all duration-400"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))",
          boxShadow: isHovered
            ? "0 12px 36px rgba(0,0,0,0.35), 0 0 30px rgba(212,175,55,0.35)"
            : "0 6px 18px rgba(0,0,0,0.25)",
        }}
      >
        {/* Inner white card */}
        <div className="bg-white rounded-[16px] overflow-hidden flex flex-col h-full">
          {/* Image container with gold border */}
          <div className="relative m-3 rounded-[12px] overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
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
                  src={getProductImage({ image, hoverImage })}
                  alt={name}
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
                  src={getProductHoverImage({ image, hoverImage })}
                  alt={`${name} close-up`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </motion.div>
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-2 px-4 py-3">
            <h3 className="text-center font-ui text-[0.9rem] font-semibold text-black sm:text-[0.95rem]">
              {name}
            </h3>
            <p className="text-center text-[0.8rem] text-gray-600 sm:text-[0.85rem]">
              {price}
            </p>
            {description && (
              <p className="text-center text-[0.7rem] text-gray-500 sm:text-[0.75rem]">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
