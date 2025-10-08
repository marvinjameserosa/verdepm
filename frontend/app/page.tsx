import * as React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Clients } from "@/components/landing/clients";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";

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
