import * as React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/section/header";
import { Hero } from "@/components/section/hero";
import { Clients } from "@/components/section/clients";
import { Features } from "@/components/section/features";
import { Footer } from "@/components/section/footer";

export const metadata: Metadata = {
  title: "Welcome to Verde - Your Trusted Software Development Partner",
};

export default function Home() {
  return (
    <>
      <Header />
      <main className="overflow-hidden">
        <Hero />
        <Clients />
        <Features />
      </main>

      <Footer />
    </>
  );
}
