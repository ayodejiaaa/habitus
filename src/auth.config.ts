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
      
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isAdmin = nextUrl.pathname.startsWith("/admin");
      const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

      if (isDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirects to signIn (which is /login)
      }
      
      if (isAdmin) {
        if (isLoggedIn && role === "ADMIN") return true;
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      
      if (isAuthPage) {
        if (isLoggedIn) {
          if (role === "ADMIN") {
            return Response.redirect(new URL("/admin", nextUrl));
          }
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      
      return true;
    },
  },
  providers: [], // Empty array, configured in auth.ts
} satisfies NextAuthConfig;
