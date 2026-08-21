/**
 * src/auth.ts
 *
 * Auth.js (NextAuth v5) Configuration with Credentials provider and JWT session.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByEmail, recordFailedLogin, recordSuccessfulLogin } from "@/lib/db/repositories/users";
import { verifyPassword } from "@/lib/auth/password";
import type { UserRole, PartnerType } from "@/lib/db/models/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email);
        const password = String(credentials.password);

        try {
          const user = await findUserByEmail(email);
          if (!user) {
            return null; // Generic error
          }

          if (user.status !== "ACTIVE") {
            return null; // Generic error
          }

          if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            return null; // Account currently locked due to failed login attempts
          }

          const isValid = await verifyPassword(password, user.passwordHash);
          if (!isValid) {
            if (user._id) {
              await recordFailedLogin(user._id);
            }
            return null; // Generic error
          }

          if (user._id) {
            await recordSuccessfulLogin(user._id);
          }

          return {
            id: user._id!.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            partnerType: user.partnerType,
            organizationId: user.organizationId?.toString(),
            mustChangePassword: user.mustChangePassword,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: UserRole }).role;
        token.partnerType = (user as unknown as { partnerType?: PartnerType }).partnerType;
        token.organizationId = (user as unknown as { organizationId?: string }).organizationId;
        token.mustChangePassword = (user as unknown as { mustChangePassword: boolean }).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { role: UserRole }).role = token.role as UserRole;
        (session.user as unknown as { partnerType?: PartnerType }).partnerType = token.partnerType as PartnerType | undefined;
        (session.user as unknown as { organizationId?: string }).organizationId = token.organizationId as string | undefined;
        (session.user as unknown as { mustChangePassword: boolean }).mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    },
  },
  pages: {
    signIn: "/en/login",
    error: "/en/login",
  },
  secret: process.env.AUTH_SECRET,
});
