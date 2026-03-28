import type { NextAuthConfig } from "next-auth";
import type { UserType, UserRole } from "./types";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const authConfig = {
  basePath: "/api/auth",
  trustHost: true,
  pages: {
    signIn: `${base}/login`,
    newUser: `${base}/`,
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type as UserType;
        token.role = user.role as UserRole;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.type = token.type as "regular";
        session.user.role = token.role as "user" | "admin";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Redirect /register → /login (registratie is uitgeschakeld)
      if (pathname.startsWith(`${base}/register`)) {
        return Response.redirect(new URL(`${base}/login`, nextUrl));
      }

      // Ingelogde gebruiker hoeft niet naar /login
      if (pathname === `${base}/login` || pathname === `${base}/login/`) {
        if (isLoggedIn) return Response.redirect(new URL(`${base}/`, nextUrl));
        return true;
      }

      // Alle andere pagina's vereisen login
      if (!isLoggedIn) return false;

      // /admin alleen voor admins
      if (pathname.startsWith(`${base}/admin`)) {
        const role = (auth as { user?: { role?: string } })?.user?.role;
        if (role !== "admin") {
          return Response.redirect(new URL(`${base}/`, nextUrl));
        }
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
