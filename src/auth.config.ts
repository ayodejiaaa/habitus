import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role;
      const isEmailVerified = !!(auth?.user as any)?.emailVerified;
      
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isAdmin = nextUrl.pathname.startsWith("/admin");
      const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

      if (isDashboard || isAdmin) {
        if (!isLoggedIn) return false;
        
        // Restrict unverified accounts
        if (!isEmailVerified) {
          return Response.redirect(new URL("/verify-email/pending", nextUrl));
        }

        if (isAdmin && role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      
      if (isAuthPage) {
        if (isLoggedIn) {
          if (isEmailVerified) {
            if (role === "ADMIN") {
              return Response.redirect(new URL("/admin", nextUrl));
            }
            return Response.redirect(new URL("/dashboard", nextUrl));
          } else {
            return Response.redirect(new URL("/verify-email/pending", nextUrl));
          }
        }
        return true;
      }
      
      return true;
    },
  },
  providers: [], // Empty array, configured in auth.ts
} satisfies NextAuthConfig;
