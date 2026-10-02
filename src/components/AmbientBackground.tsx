// Global ambient background — uses 100% GPU-composited CSS keyframes (off main thread)
// for locked 60+ FPS performance without JavaScript loop overhead.
export function AnimatedGradientOrb({ className, color, delay = "0s", duration = "12s" }: { className?: string; color: string; delay?: string; duration?: string }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${color} ${className || ""}`}
      style={{
        animation: `gpuOrbFloat ${duration} ease-in-out infinite`,
        animationDelay: delay,
        willChange: "transform, opacity",
        transform: "translate3d(0, 0, 0)",
        filter: "blur(72px)",
      }}
    />
  );
}

export default function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden"
      style={{
        background: "var(--aurora-bg)",
        contain: "strict",
      }}
    >
      <style>{`
        @keyframes gpuOrbFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            opacity: 0.35;
          }
          50% {
            transform: translate3d(30px, -20px, 0) scale(1.15) rotate(25deg);
            opacity: 0.55;
          }
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(var(--aurora-primary-rgb, 109,93,246), 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--aurora-primary-rgb, 109,93,246), 0.04) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      {/* Dark mode: indigo/purple orbs with staggered GPU animations */}
      <AnimatedGradientOrb color="bg-indigo-500/30 dark:bg-indigo-500/40" className="-top-40 -left-40 w-[550px] h-[550px]" delay="0s" duration="14s" />
      <AnimatedGradientOrb color="bg-purple-500/30 dark:bg-purple-500/40" className="top-1/3 -right-40 w-[480px] h-[480px]" delay="3s" duration="16s" />
      <AnimatedGradientOrb color="bg-indigo-400/20 dark:bg-indigo-500/30" className="bottom-1/4 left-1/3 w-[380px] h-[380px]" delay="6s" duration="12s" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
    </div>
  );
}
