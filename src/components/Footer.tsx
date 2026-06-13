import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="flex flex-col space-y-3">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-primary">Habitus</span>
                <span className="h-2 w-2 rounded-full bg-accent"></span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                A Product of{" "}
                <a
                  href="https://akowe.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary underline decoration-dotted transition-colors hover:decoration-solid"
                >
                  Akowe Inc.
                </a>
              </p>
            </div>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              Independent construction verification for Africans in the diaspora. Helping you verify and build with confidence back home.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Quick Links</span>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-primary transition-colors">Home</Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-primary transition-colors">How It Works</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</Link>
            </div>
          </div>

          {/* Core Values */}
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Our Commitments</span>
            <div className="flex flex-col space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                <span>Uncompromising Trust</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                <span>Absolute Transparency</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                <span>Professional Site Inspections</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} Habitus. All rights reserved.</p>
            <p className="text-[10px] text-gray-400">
              Habitus by <a href="https://akowe.ng" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-semibold">Akowe Inc.</a> &mdash; <em>Building solutions that engender trust in people, places, and transactions.</em>
            </p>
          </div>
          <div className="flex space-x-4 shrink-0">
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
