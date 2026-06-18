import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { getInspectionServices } from "@/lib/services";
import { cn } from "@/lib/utils";

export default async function PricingPage() {
  const services = await getInspectionServices();

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

      {/* Services Catalog Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
              Service Catalog
            </span>
            <h2 className="text-2xl font-black text-charcoal">Select a Stage for Verification</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const isActive = service.isActive;
              return (
                <div 
                  key={service.id}
                  className={cn(
                    "border rounded-2xl bg-brand-bg overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md",
                    isActive 
                      ? "border-primary shadow-sm" 
                      : "border-border opacity-80"
                  )}
                >
                  {/* Header */}
                  <div className={cn("p-6 text-center space-y-3", isActive ? "bg-primary text-white" : "bg-gray-105 text-gray-500 border-b border-border")}>
                    <div className="flex justify-center items-center gap-2">
                      <span className={cn("text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full", isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600")}>
                        {isActive ? "Available" : "Coming Soon"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">{service.name}</h3>
                    <p className={cn("text-xs", isActive ? "text-emerald-100" : "text-gray-400")}>
                      {isActive ? "Comprehensive site audit and verified evidence report" : "Verification for upcoming phases"}
                    </p>
                    <div className="pt-2 flex flex-col items-center">
                      <span className="text-3xl font-black">₦{service.price.toLocaleString()}</span>
                      {isActive ? (
                        <span className="text-emerald-100 text-xs font-semibold mt-0.5">($250 USD equivalent)</span>
                      ) : (
                        <span className="text-gray-400 text-xs font-semibold mt-0.5">per inspection</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6 bg-white">
                    <div className="space-y-4">
                      <p className="text-xs text-gray-500 italic leading-relaxed">
                        {service.description}
                      </p>
                      
                      <div className="border-t border-gray-100 my-2 pt-2">
                        <h4 className="font-bold text-charcoal text-[11px] uppercase tracking-wider mb-3">
                          What's included in every report:
                        </h4>
                        <ul className="space-y-2.5">
                          {features.map((feature) => (
                            <li key={feature} className="flex items-start space-x-2 text-xs">
                              <div className={cn("h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5", isActive ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400")}>
                                <Check className="h-2.5 w-2.5" />
                              </div>
                              <span className="text-gray-500">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50">
                      {isActive ? (
                        <Link href="/register" className="block w-full">
                          <Button className="w-full font-bold text-xs py-2.5">
                            Request Inspection
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          disabled 
                          className="w-full font-bold text-xs py-2.5 bg-gray-100 text-gray-400 border border-gray-250 cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <Lock className="h-3.5 w-3.5" /> Coming Soon
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
