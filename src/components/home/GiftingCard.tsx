export function GiftingCard() {
  return (
    <section className="flex justify-center px-3 sm:px-4 mt-12">
      <div
        className="w-[min(1180px,calc(100vw-1.5rem))] rounded-[22px] overflow-hidden"
        style={{
          height: "60vh",
          boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
        }}
      >
        {/* Replace later with actual gifting image */}
        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-lg">
          Gifting Poster Placeholder
        </div>
      </div>
    </section>
  );
}