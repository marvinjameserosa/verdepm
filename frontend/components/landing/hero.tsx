"use client";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { GridMotion } from "@/components/ui/grid-motion";
import { type Variants } from "framer-motion";

const transitionVariants: { item: Variants } = {
  item: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { type: "spring", bounce: 0.3, duration: 1.5 },
    },
  },
};

const gridItems = [
  "https://images.unsplash.com/photo-1547462713-a208daf9d997?auto=format&fit=crop&q=80&w=1576",
  "https://images.unsplash.com/photo-1607369165516-0e831913b397?auto=format&fit=crop&q=80&w=1074",
  "https://plus.unsplash.com/premium_photo-1742202420312-ecc1e77b5a29?auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1744656160802-c1a63908fee3?auto=format&fit=crop&q=60&w=500",
    "https://images.unsplash.com/photo-1547462713-a208daf9d997?auto=format&fit=crop&q=80&w=1576",
  "https://images.unsplash.com/photo-1607369165516-0e831913b397?auto=format&fit=crop&q=80&w=1074",
  "https://plus.unsplash.com/premium_photo-1742202420312-ecc1e77b5a29?auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1744656160802-c1a63908fee3?auto=format&fit=crop&q=60&w=500",
    "https://images.unsplash.com/photo-1547462713-a208daf9d997?auto=format&fit=crop&q=80&w=1576",
  "https://images.unsplash.com/photo-1607369165516-0e831913b397?auto=format&fit=crop&q=80&w=1074",
  "https://plus.unsplash.com/premium_photo-1742202420312-ecc1e77b5a29?auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1744656160802-c1a63908fee3?auto=format&fit=crop&q=60&w=500",
    "https://images.unsplash.com/photo-1547462713-a208daf9d997?auto=format&fit=crop&q=80&w=1576",
  "https://images.unsplash.com/photo-1607369165516-0e831913b397?auto=format&fit=crop&q=80&w=1074",
  "https://plus.unsplash.com/premium_photo-1742202420312-ecc1e77b5a29?auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1744656160802-c1a63908fee3?auto=format&fit=crop&q=60&w=500",
    "https://images.unsplash.com/photo-1547462713-a208daf9d997?auto=format&fit=crop&q=80&w=1576",
  "https://images.unsplash.com/photo-1607369165516-0e831913b397?auto=format&fit=crop&q=80&w=1074",
  "https://plus.unsplash.com/premium_photo-1742202420312-ecc1e77b5a29?auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1744656160802-c1a63908fee3?auto=format&fit=crop&q=60&w=500",
];

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white">
      {/* --- BACKGROUND DESIGN --- */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        {/* Subtle green aurora gradient */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[90rem] h-[90rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15)_0%,transparent_70%)] blur-3xl opacity-70 animate-pulse" />

        {/* Light streaks / wave effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(115deg,rgba(34,197,94,0.08)_0%,transparent_40%,rgba(255,255,255,0.05)_70%,transparent_100%)] opacity-40 animate-[pulse_8s_ease-in-out_infinite]" />

        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] opacity-5 mix-blend-overlay" />

        {/* Glow at the bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent via-neutral-950 to-black" />
      </div>

      {/* --- CONTENT --- */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <AnimatedGroup variants={{ item: transitionVariants.item }}>
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
              Building Sustainably.{" "}
              <span className="block text-green-500 font-semibold">
                Managing Intelligently.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-300 leading-relaxed">
              VerdePM transforms construction project management through
              data-driven ESG tracking — unifying environmental, social, and
              governance performance into one intelligent, transparent system.
            </p>
          </AnimatedGroup>

          {/* --- BUTTONS --- */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.75 },
                },
              },
              item: transitionVariants.item,
            }}
            className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row"
          >
            <Button
              size="lg"
              className="rounded-xl px-6 text-base bg-green-600 hover:bg-green-700 transition"
            >
              Get Free Consultation
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-xl px-6 text-base text-gray-300 hover:text-green-500"
            >
              View Our Work
            </Button>
          </AnimatedGroup>
        </div>

        {/* --- GRID PREVIEW --- */}
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: { staggerChildren: 0.05, delayChildren: 0.75 },
              },
            },
            item: transitionVariants.item,
          }}
        >
          <div className="relative mx-auto mt-16 max-w-6xl px-4">
            <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm shadow-lg shadow-green-500/10">
              <div className="aspect-[15/8]">
                <GridMotion
                  items={gridItems}
                  gradientColor="rgba(22,163,74,0.1)"
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
};
