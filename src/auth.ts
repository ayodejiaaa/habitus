import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { rateLimit, isAccountLocked, incrementFailedLoginAttempts, resetFailedLoginAttempts, getClientIp } from "@/lib/rate-limit";
import { logSecurity } from "@/lib/security";

const mockAuth = async () => {
  const globalMockUser = (global as any).__MOCK_AUTH_USER;
  return globalMockUser ? { user: globalMockUser } : null;
};

const authResult = process.env.MOCK_AUTH === "true"
  ? { 
      handlers: { GET: async () => {}, POST: async () => {} } as any, 
      auth: mockAuth as any, 
      signIn: async () => {}, 
      signOut: async () => {}, 
      unstable_update: async () => {} 
    }
  : NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const ip = await getClientIp();
        const cleanEmail = (credentials.email as string).toLowerCase().trim();

        // 1. IP Rate Limiting (10 attempts per minute)
        const ipLimitCheck = await rateLimit({
          action: "login-ip",
          identifier: ip,
          limit: 10,
          window: "1m",
        });
        if (!ipLimitCheck.success) {
          logSecurity("RATE_LIMIT_EXCEEDED", {
            ip,
            reason: "Login IP rate limit exceeded inside authorize callback",
          });
          return null;
        }

        // 2. Lockout check
        const locked = await isAccountLocked(cleanEmail);
        if (locked) {
          logSecurity("RATE_LIMIT_EXCEEDED", {
            email: cleanEmail,
            ip,
            reason: "Login attempt inside authorize callback to locked account",
          });
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: cleanEmail },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            password: true,
            passwordVersion: true,
            emailVerified: true,
          },
        });

        if (!user || !user.password) {
          await incrementFailedLoginAttempts(cleanEmail);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          await incrementFailedLoginAttempts(cleanEmail);
          return null;
        }

        // Reset failed login attempts on successful credentials verification
        await resetFailedLoginAttempts(cleanEmail);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          passwordVersion: user.passwordVersion,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
      }
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.passwordVersion = (user as any).passwordVersion || 0;
        token.emailVerified = (user as any).emailVerified;
      } else if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { passwordVersion: true, emailVerified: true, name: true, email: true, role: true },
          });
          if (!dbUser || dbUser.passwordVersion !== token.passwordVersion) {
            return {}; // returning empty token invalidates session
          }
          token.emailVerified = dbUser.emailVerified;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.role = dbUser.role;
        } catch (error) {
          console.error("JWT validation database error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.id && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).emailVerified = token.emailVerified;
        session.user.name = token.name;
        session.user.email = token.email || "";
      }
      return session;
    },
  },
});

export const { handlers, auth, signIn, signOut, unstable_update } = authResult;
