import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Eye, Sparkles, Building2, ChevronRight, AlertTriangle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-bg py-20 lg:py-32">
        {/* Subtle background graphic */}
        <div className="absolute inset-0 bg-[radial-gradient(#1F7A5A_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Independent Construction Auditing</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal leading-tight">
                Build back home with <span className="text-primary">calm confidence.</span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Stop relying on biased updates from family members or contractors. Habitus conducts professional, independent site inspections in Africa and sends you verified photo and video evidence.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Request an Inspection
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5 mt-12 lg:mt-0">
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border shadow-xl space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-secondary/15 text-secondary rounded-xl">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-charcoal">Construction Verification</h3>
                    <p className="text-xs text-gray-500">Service: Site Audit & Report</p>
                  </div>
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-gray-500 font-medium">Deliverables:</span>
                    <span className="text-charcoal font-semibold text-right">Photo + Video Evidence, Findings, Recommendations</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Turnaround:</span>
                    <span className="text-charcoal font-semibold">3-5 Business Days</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Verification Team:</span>
                    <span className="text-primary font-bold">Habitus Offline Inspectors</span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 flex items-start space-x-3 text-xs text-primary font-medium">
                  <Eye className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    "I can finally see what is happening on my building project."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The Pain Point Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-charcoal sm:text-4xl">
              Why diaspora property owners face uncertainty
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Managing a project from thousands of miles away is stressful. Common issues include:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-100 rounded-xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-red-50 text-red-500 rounded-lg w-fit">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-charcoal">Misinformation</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Contractors or family members sending outdated photos, showing other properties, or concealing defects.
              </p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-red-50 text-red-500 rounded-lg w-fit">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-charcoal">Project Delays</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Funds requested for materials and labor while work remains frozen or progresses at a crawl.
              </p>
            </div>

            <div className="p-6 border border-gray-100 rounded-xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-red-50 text-red-500 rounded-lg w-fit">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-charcoal">Financial Loss</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Paying for foundations, structures, or roofs that never get completed, or built using substandard materials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inspector Showcase Section */}
      <section className="py-20 bg-brand-bg border-t border-b border-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            {/* Image (Left) */}
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-2xl border border-border group bg-gray-50">
              <img
                src="/images/inspector_at_site.png"
                alt="Certified Habitus Inspector conducting structural verification at a residential site in Lagos, Nigeria"
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0)_50%)]"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-xs font-bold text-accent uppercase tracking-wider">Lagos Site Verification</p>
                <p className="text-sm font-semibold mt-0.5">Auditor: Habitus Field Inspector Team</p>
              </div>
            </div>

            {/* Description (Right) */}
            <div className="lg:col-span-7 mt-12 lg:mt-0 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                <span>🛡️</span>
                <span>Verified Local Auditing Professionals</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal leading-tight">
                Our inspectors are <span className="text-primary">qualified, local, and completely independent.</span>
              </h2>
              
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                We recruit certified civil engineers and construction professionals in Lagos who have zero interest in your developer's sales sheets or contractor relationships. They inspect the structural concrete, wall integrity, roofing timbers, and finishing work.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                    <span className="text-accent">📸</span> High-Res Evidence
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Detailed photos of brickwork, foundations, concrete mixes, and drainage to verify material quality.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                    <span className="text-accent">🎥</span> Uncut Video Logs
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Walkthrough recordings of the site to show layout deviations, site cleanliness, and ongoing labor numbers.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/pricing">
                  <Button size="lg" className="font-bold">
                    Order Site Verification (₦350k)
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Habitus Solution */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold">
                <Sparkles className="h-4 w-4" />
                <span>The Habitus Shield</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal">
                Professional, Unbiased Inspections. Direct to Your Screen.
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We contract certified local site inspectors who act as your eyes on the ground. They visit your property, audit the work, take photos/videos, and submit their assessment directly to our team.
              </p>
              
              <ul className="space-y-4 pt-2">
                <li className="flex items-start space-x-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                  <span className="text-gray-700">Detailed executive summary with progress assessment (On Track, Needs Attention, Issue Detected).</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                  <span className="text-gray-700">Bullet points of key findings (workmanship quality, materials checks).</span>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                  <span className="text-gray-700">Clear recommendations on next steps (Proceed, Proceed with Caution, Pause Funding).</span>
                </li>
              </ul>
            </div>

            <div className="mt-12 lg:mt-0 bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Inspection Report</span>
                  <h4 className="font-bold text-charcoal">Lekki Residential Phase II</h4>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                  Needs Attention
                </span>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-bold text-xs uppercase text-gray-400">Executive Summary</span>
                  <p className="text-gray-600 mt-1 text-xs sm:text-sm">
                    Structural brickwork is 80% complete. However, roof support timbers show minor alignment deviations. Recommend contractor corrects before roofing starts.
                  </p>
                </div>

                <div>
                  <span className="font-bold text-xs uppercase text-gray-400">Recommendation</span>
                  <p className="text-amber-700 font-semibold mt-1">
                    Proceed With Caution (Address timber alignment before funding roof sheets)
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <div className="h-16 w-24 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">Photo 1</div>
                  <div className="h-16 w-24 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">Photo 2</div>
                  <div className="h-16 w-24 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">Video Log</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="bg-primary py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to verify your building project?</h2>
          <p className="text-emerald-100 max-w-xl mx-auto text-sm sm:text-base">
            Join other diaspora property owners who build with full transparency. Get independent reports from our verified inspectors.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button variant="accent" size="lg" className="px-8 font-bold">
                Get Started Now <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
