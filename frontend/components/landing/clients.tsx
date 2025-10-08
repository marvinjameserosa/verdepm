import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Clients = () => {
  return (
    <section className="bg-background py-16 md:py-32">
      <div className="group relative m-auto max-w-5xl px-6">
        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
          <Link
            href="#contact"
            className="block text-sm duration-150 hover:opacity-75 text-orange-500"
          >
            <span>Ready to Start Your Project?</span>
            <ChevronRight className="ml-1 inline-block size-3" />
          </Link>
        </div>
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-4 text-muted-foreground">
            We are proud to have worked with a diverse range of clients, from
            startups to Fortune 500 companies.
          </p>
        </div>
        <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
          <div className="flex">
            <Image
              className="mx-auto h-5 w-fit dark:invert opacity-60"
              src="https://html.tailus.io/blocks/customers/nvidia.svg"
              alt="Client Logo"
              height={20}
              width={100}
            />
          </div>
          <div className="flex">
            <Image
              className="mx-auto h-4 w-fit dark:invert opacity-60"
              src="https://html.tailus.io/blocks/customers/column.svg"
              alt="Client Logo"
              height={16}
              width={100}
            />
          </div>
          <div className="flex">
            <Image
              className="mx-auto h-4 w-fit dark:invert opacity-60"
              src="https://html.tailus.io/blocks/customers/github.svg"
              alt="Client Logo"
              height={16}
              width={100}
            />
          </div>
          <div className="flex">
            <Image
              className="mx-auto h-5 w-fit dark:invert opacity-60"
              src="https://html.tailus.io/blocks/customers/nike.svg"
              alt="Client Logo"
              height={20}
              width={100}
            />
          </div>
          <div className="flex">
            <Image
              className="mx-auto h-5 w-fit dark:invert opacity-60"
              src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
              alt="Client Logo"
              height={20}
              width={100}
            />
          </div>
          <div className="flex">
            <Image
              className="mx-auto h-4 w-fit dark:invert opacity-60"
              src="https://html.tailus.io/blocks/customers/laravel.svg"
              alt="Client Logo"
              height={16}
              width={100}
            />
          </div>
          <div className="flex">
            <Image
              className="mx-auto h-7 w-fit dark:invert opacity-60"
              src="https://html.tailus.io/blocks/customers/lilly.svg"
              alt="Client Logo"
              height={28}
              width={100}
            />
          </div>
          <div className="flex">
            <Image
              className="mx-auto h-6 w-fit dark:invert opacity-60"
              src="https://html.tailus.io/blocks/customers/openai.svg"
              alt="Client Logo"
              height={24}
              width={100}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
