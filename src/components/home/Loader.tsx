import { DiamondMark } from "./DiamondMark";

type LoaderProps = {
  visible: boolean;
};

export function Loader({ visible }: LoaderProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.24),rgba(4,99,7,0.04),transparent_70%)] blur-2xl" />
        <div className="absolute h-28 w-28 rounded-full border border-black/5" />
        <div className="animate-jewel-loader-pulse relative flex items-center justify-center">
          <DiamondMark size={76} />
        </div>
        <span className="animate-jewel-loader-rim absolute h-36 w-36 rounded-full border border-[rgba(212,175,55,0.14)] [border-image:linear-gradient(90deg,rgba(212,175,55,0.18),rgba(4,99,7,0.18),rgba(212,175,55,0.18))_1]" />
      </div>
    </div>
  );
}