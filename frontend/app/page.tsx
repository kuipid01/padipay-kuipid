"use client";

import { NavBar } from "@/components/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { Features } from "@/components/landing/features";
import { OurValue } from "@/components/landing/our-value";
import { Overview } from "@/components/landing/overview";
import { Integrations } from "@/components/landing/integrations";
import { Testimonials } from "@/components/landing/testimonials";
import { Plans } from "@/components/landing/plans";
import { Faq } from "@/components/landing/faq";
import { BottomImage } from "@/components/landing/bottom-image";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <NavBar />

      <HeroSection />
      <Features />
      <OurValue />
      <Overview />

      {/* //TODO:RETSORE */}
      {/* <Integrations /> */}
      <Testimonials />

      <Plans />
      <Faq />
      <BottomImage />

      <LandingFooter />
    </main>
  );
}
