import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

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
                    <p className="text-sm text-gray-500">support@habitus.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Phone Enquiry</h4>
                    <p className="text-sm text-gray-500">+1 (800) HABITUS</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Mailing Address</h4>
                    <p className="text-sm text-gray-500">
                      Habitus Technologies, 100 Pine Street, San Francisco, CA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Contact Form (Frontend demonstration) */}
            <div className="bg-brand-bg rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">First Name</label>
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your request or property details..."
                    className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <Button type="button" className="w-full font-bold">
                  Send Message
                </Button>
              </form>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
