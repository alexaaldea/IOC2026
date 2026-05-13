import { motion } from "framer-motion";

export function Waveform({ active }: { active: boolean }) {
  const bars = Array.from({ length: 18 });
  return (
    <div className="flex h-6 items-center justify-center gap-[3px]">
      {bars.map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-sm bg-pit-green"
          animate={
            active
              ? { height: [4, 18 - (i % 5) * 2, 6, 22 - (i % 4) * 3, 4] }
              : { height: 3 }
          }
          transition={{
            duration: 0.9 + (i % 4) * 0.1,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
            delay: i * 0.03,
          }}
          style={{ height: 4 }}
        />
      ))}
    </div>
  );
}
