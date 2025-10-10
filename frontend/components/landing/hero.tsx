import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { GridMotion } from "@/components/ui/grid-motion";
import { type Variants } from "framer-motion";

const transitionVariants: { item: Variants } = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

// 🌿 Free Unsplash stock images (eco, construction, sustainability)
const gridItems = [
  "https://images.unsplash.com/photo-1547462713-a208daf9d997?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1576",
  "https://images.unsplash.com/photo-1607369165516-0e831913b397?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
  "https://plus.unsplash.com/premium_photo-1742202420312-ecc1e77b5a29?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1744656160802-c1a63908fee3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGVzZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
    "https://images.unsplash.com/photo-1547462713-a208daf9d997?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1576",
  "https://images.unsplash.com/photo-1607369165516-0e831913b397?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
  "https://plus.unsplash.com/premium_photo-1742202420312-ecc1e77b5a29?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1744656160802-c1a63908fee3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGVzZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
    "https://images.unsplash.com/photo-1547462713-a208daf9d997?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1576",
  "https://images.unsplash.com/photo-1607369165516-0e831913b397?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
  "https://plus.unsplash.com/premium_photo-1742202420312-ecc1e77b5a29?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1744656160802-c1a63908fee3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGVzZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
    "https://images.unsplash.com/photo-1547462713-a208daf9d997?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1576",
  "https://images.unsplash.com/photo-1607369165516-0e831913b397?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
  "https://plus.unsplash.com/premium_photo-1742202420312-ecc1e77b5a29?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1744656160802-c1a63908fee3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGVzZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
    "https://images.unsplash.com/photo-1547462713-a208daf9d997?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1576",
  "https://images.unsplash.com/photo-1607369165516-0e831913b397?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
  "https://plus.unsplash.com/premium_photo-1742202420312-ecc1e77b5a29?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1744656160802-c1a63908fee3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGVzZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
    "https://images.unsplash.com/photo-1547462713-a208daf9d997?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1576",
  "https://images.unsplash.com/photo-1607369165516-0e831913b397?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
  "https://plus.unsplash.com/premium_photo-1742202420312-ecc1e77b5a29?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  "https://images.unsplash.com/photo-1744656160802-c1a63908fee3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGVzZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
];

export const Hero = () => {
  return (
    <>
      {/* Soft green radial glow background */}
      <div
        aria-hidden
        className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block"
      >
        <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(142,70%,45%,.08)_0,hsla(142,70%,35%,.02)_50%,hsla(142,70%,30%,0)_80%)]" />
        <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(142,70%,45%,.06)_0,hsla(142,70%,35%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
      </div>

      <section>
        <div className="relative pt-24 md:pt-36">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
          />

          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
              <AnimatedGroup variants={{ item: transitionVariants.item }}>
                <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                  Building Sustainably.{" "}
                  <span className="inline-block text-green-600 text-6xl md:text-7xl xl:text-[5.25rem] font-semibold">
                    Managing Intelligently
                  </span>
                </h1>
                <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                  VerdePM transforms construction project management through
                  data-driven ESG tracking — unifying environmental, social, and
                  governance performance into one intelligent, transparent system.
                </p>
              </AnimatedGroup>

              {/* Buttons */}
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  item: transitionVariants.item,
                }}
                className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
              >
                <div
                  key={1}
                  className="bg-green-500/10 rounded-[14px] border border-green-200 p-0.5"
                >
                  <Button
                    size="lg"
                    className="rounded-xl px-5 text-base bg-green-600 hover:bg-green-700"
                  >
                    <span className="text-nowrap">Get Free Consultation</span>
                  </Button>
                </div>
                <Button
                  key={2}
                  size="lg"
                  variant="ghost"
                  className="h-10.5 rounded-xl px-5 hover:text-green-600"
                >
                  <span className="text-nowrap">View Our Work</span>
                </Button>
              </AnimatedGroup>
            </div>
          </div>

          {/* Grid Section */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.75,
                  },
                },
              },
              item: transitionVariants.item,
            }}
          >
            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
              <div
                aria-hidden
                className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
              />
              <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-green-200 p-4 shadow-lg shadow-green-500/15 ring-1">
                <div className="aspect-15/8 relative rounded-2xl border border-green-200 overflow-hidden">
                  <GridMotion
                    items={gridItems}
                    gradientColor="rgba(22, 163, 74, 0.1)"
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </AnimatedGroup>
        </div>
      </section>
    </>
  );
};
