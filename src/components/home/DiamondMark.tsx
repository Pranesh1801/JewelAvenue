type DiamondMarkProps = {
  className?: string;
  size?: number;
};

export function DiamondMark({ className = "", size = 32 }: DiamondMarkProps) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/JA_logo.png"
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: "drop-shadow(0 0 8px rgba(212,175,55,0.4))",
        }}
      />
    </span>
  );
}
