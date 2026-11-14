import { Suspense } from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/landing/hero/hero-section";
import IntroLoader from "@/components/landing/intro/intro-loader";
import ProductsSection from "@/components/landing/sections/products/products-section";
import ReportSection from "@/components/landing/sections/report/report-section";
import LaptopSection from "@/components/landing/sections/laptop/laptop-section";
import ProcessSection from "@/components/landing/sections/process/process-section";
import FeaturesSection from "@/components/landing/sections/features/features-section";
import FaqSection from "@/components/landing/sections/faq/faq-section";
import CtaSection from "@/components/landing/sections/cta/cta-section";
import FooterSection from "@/components/landing/sections/footer/footer-section";
import FloatingFooter from "@/components/landing/floating-footer";
import SectionDots from "@/components/landing/section-dots";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";

export const metadata: Metadata = {
  icons: { icon: "/landing/logo/pathkr-icon.svg" },
};

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <LoginRequiredDialog />
      </Suspense>
      <IntroLoader />
      <main data-landing>
        <HeroSection />
        <ProductsSection />
        <ReportSection />
        <LaptopSection />
        <ProcessSection />
        <FeaturesSection />
        <FaqSection />
        <CtaSection />
      </main>
      <FooterSection />
      <FloatingFooter />
      <SectionDots />
    </>
  );
}
