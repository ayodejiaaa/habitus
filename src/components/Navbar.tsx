import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "./ui/button";
import { logoutUser } from "@/lib/actions";

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-tight text-primary">
            Habitus
          </span>
          <span className="h-2.5 w-2.5 rounded-full bg-accent"></span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-sm font-semibold text-charcoal hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/how-it-works" className="text-sm font-semibold text-charcoal hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="/pricing" className="text-sm font-semibold text-charcoal hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-semibold text-charcoal hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-charcoal hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link href={isAdmin ? "/admin" : "/dashboard"}>
                <Button size="sm">Dashboard</Button>
              </Link>
              <form action={logoutUser}>
                <Button variant="ghost" size="sm" type="submit">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-charcoal hover:text-primary transition-colors">
                Login
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
