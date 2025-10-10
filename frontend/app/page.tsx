import * as React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Platform } from "@/components/landing/platform";
import { ESG } from "@/components/landing/esg";
import { Footer } from "@/components/landing/footer";
import { Features } from "@/components/landing/features";

export const metadata: Metadata = {
  title: "Welcome to Verde - Your Trusted Software Development Partner",
};

export default function Home() {
  return (
    <>
      <Header />
      <main className="overflow-hidden">
        <Hero />
        <Platform />
        <ESG />
        <Features />
      </main>

      <Footer />
    </>
  );
}
