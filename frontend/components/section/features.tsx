import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Settings2, Sparkles, Zap } from "lucide-react";

const CardDecorator = ({ children }: { children: React.ReactNode }) => (
  <div
    aria-hidden
    className="relative mx-auto size-36 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
  >
    <div className="absolute inset-0 [--border:black] dark:[--border:white] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l border-orange-200">
      {children}
    </div>
  </div>
);

export const Features = () => {
  return (
    <section className="bg-muted/50 py-16 md:py-32 dark:bg-transparent">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Why Choose <span className="text-orange-500">DevSolutions</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            We deliver high-quality software solutions that help your business
            grow and succeed in the digital world.
          </p>
        </div>
        <Card className="@min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 border-orange-200 *:text-center md:mt-16">
          <div className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Zap className="size-6 text-orange-500" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Fast Development</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rapid prototyping and agile development process to get your
                software to market quickly.
              </p>
            </CardContent>
          </div>

          <div className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Settings2 className="size-6 text-orange-500" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Scalable Solutions</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                Built to grow with your business, our solutions scale seamlessly
                as your needs evolve.
              </p>
            </CardContent>
          </div>

          <div className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Sparkles className="size-6 text-orange-500" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Modern Technology</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                Using the latest technologies and best practices to ensure your
                software is future-proof.
              </p>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
};
