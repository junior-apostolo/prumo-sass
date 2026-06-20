import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProfessionsStrip } from "@/components/landing/professions-strip";
import { ProblemSection } from "@/components/landing/problem-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PdfShowcase } from "@/components/landing/pdf-showcase";
import { PricingSection } from "@/components/landing/pricing-section";
import { Testimonials } from "@/components/landing/testimonials";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaFinal } from "@/components/landing/cta-final";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="bg-white text-[#0B1220] overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <ProfessionsStrip />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorks />
        <PdfShowcase />
        <PricingSection />
        <Testimonials />
        <FaqSection />
        <CtaFinal />
      </main>
      <Footer />
    </div>
  );
}
