import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE } from "@/lib/i18n/locales";
import { localeFromRequest } from "@/lib/i18n/locale-from-request";
import { getDictionary } from "@/lib/i18n/translate";
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = localeFromRequest(
    (await cookies()).get(LOCALE_COOKIE)?.value,
    (await headers()).get("accept-language"),
  );
  const { title, description } = getDictionary(locale).landing.metadata;
  return {
    title,
    description,
    icons: { icon: "/landing/logo/pathkr-icon.svg" },
  };
}

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
