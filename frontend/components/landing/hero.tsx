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
    <section className="relative overflow-hidden bg-transparent">
      {/* --- CONTENT --- */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <AnimatedGroup variants={{ item: transitionVariants.item }}>
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold leading-tight tracking-tight text-foreground">
              Building Sustainably.{" "}
              <span className="block text-emerald-500 font-semibold">
                Managing Intelligently.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
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
              className="rounded-xl px-6 text-base bg-emerald-600 hover:bg-emerald-700 transition"
            >
              Get Free Consultation
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-xl px-6 text-base text-muted-foreground hover:text-emerald-500"
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
            <div
              style={{
                backgroundColor: "var(--blackish)",
                borderColor: "hsl(var(--border))",
                boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.1)",
              }}
              className="relative overflow-hidden rounded-2xl border backdrop-blur-sm shadow-lg"
            >
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
