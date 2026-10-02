"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-examnova-pastel text-zinc-900 dark:text-white font-sans selection:bg-pink-500 selection:text-white pt-16">
      <Navbar />
      <main className="flex-1">
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
