import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingPage() {
  const features = [
    "Independent site visit by a certified inspector",
    "Detailed executive summary with status badge",
    "Key structural & workmanship findings",
    "Clear actionable recommendations (Proceed, Caution, Pause)",
    "High-resolution photo evidence gallery",
    "Embedded video logs (YouTube, Vimeo, or Direct)",
    "Published and verified by Habitus Team",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Title Header */}
      <section className="bg-brand-bg py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="text-4xl font-extrabold text-charcoal">Simple, Transparent Pricing</h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto">
            No recurring fees or complex subscriptions. Pay per inspection and get the absolute truth about your project.
          </p>
        </div>
      </section>

      {/* Pricing Card Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          
          <div className="border border-border rounded-2xl w-full max-w-xl bg-brand-bg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            {/* Header */}
            <div className="bg-primary text-white p-8 text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                Core Service
              </span>
              <h3 className="text-2xl font-bold">Construction Verification Inspection</h3>
              <p className="text-emerald-100 text-sm">
                Comprehensive site audit and verified evidence report.
              </p>
              <div className="pt-4">
                <span className="text-4xl font-black">$199</span>
                <span className="text-emerald-200 text-sm"> / inspection</span>
              </div>
            </div>

            {/* Content / Features */}
            <div className="p-8 space-y-6 bg-white">
              <h4 className="font-bold text-charcoal text-sm uppercase tracking-wider">
                What's included in every report:
              </h4>
              
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start space-x-3 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-gray-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-6">
                <Link href="/register">
                  <Button size="lg" className="w-full font-bold">
                    Order Verification Inspection
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Pointer */}
      <section className="bg-brand-bg py-16 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-charcoal">Need multiple properties inspected?</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            You can request separate inspections for different projects directly from your dashboard. We audit residential properties, commercial facilities, and other custom build structures.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
