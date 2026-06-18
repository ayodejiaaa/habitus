import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
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

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.passwordVersion = (user as any).passwordVersion || 0;
        token.emailVerified = (user as any).emailVerified;
      } else if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { passwordVersion: true, emailVerified: true },
          });
          if (!dbUser || dbUser.passwordVersion !== token.passwordVersion) {
            return {}; // returning empty token invalidates session
          }
          token.emailVerified = dbUser.emailVerified;
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
      }
      return session;
    },
  },
});
