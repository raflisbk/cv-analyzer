import Navbar from "@/components/landing/navbar";
import UploadSection from "@/components/landing/upload-section";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section id="upload">
          <UploadSection />
        </section>
        <FeaturesSection />
        <HowItWorksSection />
      </main>
    </>
  );
}
