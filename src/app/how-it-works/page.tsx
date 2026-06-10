import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardList, UserCheck, Eye, ClipboardCheck, Award } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Submit Inspection Request",
      desc: "Provide details about your project: project name, address, current construction stage (foundation, structure, roofing, finishing), and a site contact person (contractor, site worker, or relative).",
      icon: ClipboardList,
    },
    {
      num: "02",
      title: "We Dispatch an Inspector",
      desc: "Habitus coordinates with a certified, independent local building inspector in the region of your property. Our inspectors are third-party professionals with no ties to your contractor or family.",
      icon: UserCheck,
    },
    {
      num: "03",
      title: "Site Inspection & Evidence Gathering",
      desc: "The inspector conducts a comprehensive site audit, verifying structural progress, materials used, and workmanship quality. They capture high-resolution photos and video logs.",
      icon: ClipboardCheck,
    },
    {
      num: "04",
      title: "Admin Verification & Publishing",
      desc: "The raw inspection logs are sent to Habitus admins who review and package the data. We publish the completed report directly to your dashboard with clear, actionable recommendations.",
      icon: Award,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Title Header */}
      <section className="bg-brand-bg py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="text-4xl font-extrabold text-charcoal">How It Works</h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            A transparent and independent verification pipeline built to protect your real estate investments back home.
          </p>
        </div>
      </section>

      {/* Steps List */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 relative before:absolute before:inset-0 before:left-8 before:md:left-1/2 before:w-0.5 before:bg-gray-100 before:-z-10">
            
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 0;
              return (
                <div key={step.num} className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-8 ${isEven ? "" : "md:flex-row-reverse"}`}>
                  
                  {/* Step Info */}
                  <div className="w-full md:w-[45%] space-y-3 pl-14 md:pl-0">
                    <span className="text-5xl font-black text-primary/10 tracking-tight block">
                      {step.num}
                    </span>
                    <h3 className="text-xl font-bold text-charcoal">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>

                  {/* Icon Node */}
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-4 border-white shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Empty spacer to align columns on desktop */}
                  <div className="hidden md:block w-[45%]" />
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-bg py-16 text-center border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">Get your independent site audit today</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">
            Stop guessing about brick counts, structure stability, or roofing delays. Let Habitus verify it.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button size="lg">Request First Inspection</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
