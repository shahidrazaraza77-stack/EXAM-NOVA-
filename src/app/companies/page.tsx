"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import CompanyHubSection from "@/components/CompanyHubSection";
import PlacementAnalyticsSection from "@/components/PlacementAnalyticsSection";
import Footer from "@/components/Footer";

export default function CompaniesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-examnova-pastel text-zinc-900 dark:text-white font-sans selection:bg-pink-500 selection:text-white pt-16">
      <Navbar />
      <main className="flex-1">
        <CompanyHubSection />
        <PlacementAnalyticsSection />
      </main>
      <Footer />
    </div>
  );
}
