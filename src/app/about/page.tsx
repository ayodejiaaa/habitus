import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Eye, Award, Landmark } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  const values = [
    {
      title: "Trust",
      desc: "We stand as an independent third party. We do not work for your contractors, and we have no family biases. Our only loyalty is to the truth.",
      icon: Shield,
    },
    {
      title: "Transparency",
      desc: "We deliver raw, unedited photo and video logs alongside expert notes, ensuring that you see exactly what our inspectors see on the ground.",
      icon: Eye,
    },
    {
      title: "Accountability",
      desc: "Our structured reports evaluate construction progress against standard timelines and material specs, holding contractors accountable.",
      icon: Award,
    },
    {
      title: "Calm Confidence",
      desc: "By bridging the information gap across thousands of miles, we bring peace of mind to diaspora builders investing in their homeland.",
      icon: Landmark,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Header */}
      <section className="bg-brand-bg py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="text-4xl font-extrabold text-charcoal">About Habitus</h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            Restoring integrity and transparency to diaspora real estate development.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center md:text-left">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Every year, thousands of Africans in the diaspora send money home to build houses, shops, and investment properties. Too often, they receive updates that range from inaccurate to outright fraudulent. Stories of funds diverted to other uses or substandard workmanship are all too common.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Habitus was founded to solve this problem. We provide a bridge of trust. By connecting you with professional on-the-ground inspectors, we deliver independent site audits so you can verify construction progress and quality for yourself.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-20 bg-brand-bg border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-charcoal">Our Core Values</h2>
            <p className="text-gray-500 text-sm">
              These principles guide how we inspect, audit, and report on your building projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <div key={val.title} className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-4">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-lg w-fit">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-charcoal">{val.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
