import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { GridMotion } from "@/components/ui/grid-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
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

const gridItems = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vackground-com-agUC-v_D1iI-unsplash.jpg-pDc7YFeKWRKuQUIfTDRQbL5KvVGdKz.jpeg", // Abstract fluid gradient
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/barbara-zandoval-w0lI3AkD14A-unsplash.jpg-Adgy1wX78497i2gyUSxXOAbCRTxUkH.jpeg", // VR/AR experience
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nahrizul-kadri-OAsF0QMRWlA-unsplash.jpg-JZ7f9oQ0QnvD5ALJRKIT4Os48cf17H.jpeg", // AI text on whiteboard
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cash-macanaya-X9Cemmq4YjM-unsplash.jpg-zNFoJl9wNLXUsmAczT3zaIHP8aBuYQ.jpeg", // Human-AI interaction
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luke-jones-ac6UGoeSUSE-unsplash.jpg-XN84qqtkVV8r7mv7yJwpycndMf6WSH.jpeg", // Digital eye/AI vision
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/zhenyu-luo-kE0JmtbvXxM-unsplash.jpg-3aQSKrDe9SqRO3cQwItdSjDrVgbagu.jpeg", // Industrial robot
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vackground-com-7iq4VEHLNGU-unsplash.jpg-t2Cwv7CGFggABt2Ov9p00RIU0CFP5t.jpeg", // Abstract purple flow patterns
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/google-deepmind-tikhtH3QRSQ-unsplash.jpg-d1XmnWdOT6Fg6keJxmQO7TP1a0JUhg.jpeg", // Futuristic data beam
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/immo-wegmann-vi1HXPw6hyw-unsplash.jpg-FkdIitTUJu66Fm7AcnectgJ8STyAE0.jpeg", // AI keyboard concept
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luke-jones-tBvF46kmwBw-unsplash.jpg-LfdDPksYC4VWZSEXLClGA82y8MtB28.jpeg", // Fiber optic network
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vackground-com-agUC-v_D1iI-unsplash.jpg-pDc7YFeKWRKuQUIfTDRQbL5KvVGdKz.jpeg", // Abstract fluid gradient (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/barbara-zandoval-w0lI3AkD14A-unsplash.jpg-Adgy1wX78497i2gyUSxXOAbCRTxUkH.jpeg", // VR/AR experience (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nahrizul-kadri-OAsF0QMRWlA-unsplash.jpg-JZ7f9oQ0QnvD5ALJRKIT4Os48cf17H.jpeg", // AI text on whiteboard (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cash-macanaya-X9Cemmq4YjM-unsplash.jpg-zNFoJl9wNLXUsmAczT3zaIHP8aBuYQ.jpeg", // Human-AI interaction (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luke-jones-ac6UGoeSUSE-unsplash.jpg-XN84qqtkVV8r7mv7yJwpycndMf6WSH.jpeg", // Digital eye/AI vision (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/zhenyu-luo-kE0JmtbvXxM-unsplash.jpg-3aQSKrDe9SqRO3cQwItdSjDrVgbagu.jpeg", // Industrial robot (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vackground-com-7iq4VEHLNGU-unsplash.jpg-t2Cwv7CGFggABt2Ov9p00RIU0CFP5t.jpeg", // Abstract purple flow patterns (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/google-deepmind-tikhtH3QRSQ-unsplash.jpg-d1XmnWdOT6Fg6keJxmQO7TP1a0JUhg.jpeg", // Futuristic data beam (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/immo-wegmann-vi1HXPw6hyw-unsplash.jpg-FkdIitTUJu66Fm7AcnectgJ8STyAE0.jpeg", // AI keyboard concept (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luke-jones-tBvF46kmwBw-unsplash.jpg-LfdDPksYC4VWZSEXLClGA82y8MtB28.jpeg", // Fiber optic network (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vackground-com-agUC-v_D1iI-unsplash.jpg-pDc7YFeKWRKuQUIfTDRQbL5KvVGdKz.jpeg", // Abstract fluid gradient (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/barbara-zandoval-w0lI3AkD14A-unsplash.jpg-Adgy1wX78497i2gyUSxXOAbCRTxUkH.jpeg", // VR/AR experience (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nahrizul-kadri-OAsF0QMRWlA-unsplash.jpg-JZ7f9oQ0QnvD5ALJRKIT4Os48cf17H.jpeg", // AI text on whiteboard (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cash-macanaya-X9Cemmq4YjM-unsplash.jpg-zNFoJl9wNLXUsmAczT3zaIHP8aBuYQ.jpeg", // Human-AI interaction (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luke-jones-ac6UGoeSUSE-unsplash.jpg-XN84qqtkVV8r7mv7yJwpycndMf6WSH.jpeg", // Digital eye/AI vision (repeat)
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/zhenyu-luo-kE0JmtbvXxM-unsplash.jpg-3aQSKrDe9SqRO3cQwItdSjDrVgbagu.jpeg", // Industrial robot (repeat)
];

export const Hero = () => {
  return (
    <>
      <div
        aria-hidden
        className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block"
      >
        <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(25,100%,50%,.08)_0,hsla(25,100%,45%,.02)_50%,hsla(25,100%,40%,0)_80%)]" />
        <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(25,100%,50%,.06)_0,hsla(25,100%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
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
                <Link
                  href="#services"
                  className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                >
                  <span className="text-foreground text-sm">
                    Custom Software Solutions for Small Business
                  </span>
                  <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                  <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                    </div>
                  </div>
                </Link>

                <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                  Building Sustainably.{" "}
                  <span className="inline-block text-orange-500 text-6xl md:text-7xl xl:text-[5.25rem] font-semibold">
                    Managing Intelligently
                  </span>
                </h1>
                <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                  VerdePM transforms construction project management through data-driven ESG tracking — unifying environmental, social, and governance performance into one intelligent, transparent system.
                </p>
              </AnimatedGroup>

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
                  className="bg-orange-500/10 rounded-[14px] border border-orange-200 p-0.5"
                >
                  <Button
                    size="lg"
                    className="rounded-xl px-5 text-base bg-orange-500 hover:bg-orange-600"
                  >
                    <span className="text-nowrap">Get Free Consultation</span>
                  </Button>
                </div>
                <Button
                  key={2}
                  size="lg"
                  variant="ghost"
                  className="h-10.5 rounded-xl px-5 hover:text-orange-500"
                >
                  <span className="text-nowrap">View Our Work</span>
                </Button>
              </AnimatedGroup>
            </div>
          </div>

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
              <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-orange-200 p-4 shadow-lg shadow-orange-500/15 ring-1">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 aspect-15/8 relative rounded-2xl border border-orange-200 overflow-hidden">
                  <GridMotion
                    items={gridItems}
                    gradientColor="rgba(249, 115, 22, 0.1)"
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
