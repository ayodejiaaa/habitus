import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Title Header */}
      <section className="bg-brand-bg py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="text-4xl font-extrabold text-charcoal">Contact Us</h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto">
            Have questions about our inspection coverage or need support with an ongoing audit? We are here to help.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Details */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-charcoal">Get in Touch</h2>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                  Our customer support team works to keep you connected with your inspectors and resolve any billing, request, or technical inquiries.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Email Support</h4>
                    <p className="text-sm text-gray-500">contact@habitus.africa</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Phone Enquiry</h4>
                    <p className="text-sm text-gray-500">+234 708 056 5000</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Mailing Address</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      43B Emina Crescent, off Toyin Street, Ikeja, Lagos, Nigeria.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm />

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
