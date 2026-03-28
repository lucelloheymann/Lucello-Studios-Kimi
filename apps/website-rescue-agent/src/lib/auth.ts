import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

// Internes Tool — einfache Credentials-Auth für Luis & Marcel
// Für Produktion: eigene User-DB oder OAuth (GitHub, Google) einbinden

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Temporäre User-Liste (für MVP — später DB-basiert)
const TEAM_USERS = [
  {
    id: "user_luis",
    name: "Luis",
    email: process.env.AUTH_USER_LUIS_EMAIL || "luis@lucellostudio.de",
    passwordHash: process.env.AUTH_USER_LUIS_PASSWORD || "change-me-in-env",
  },
  {
    id: "user_marcel",
    name: "Marcel",
    email: process.env.AUTH_USER_MARCEL_EMAIL || "marcel@lucellostudio.de",
    passwordHash: process.env.AUTH_USER_MARCEL_PASSWORD || "change-me-in-env",
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = TEAM_USERS.find((u) => u.email === email);

        if (!user) return null;

        // MVP: direkter String-Vergleich (für Prod: bcrypt-Hash verwenden!)
        if (user.passwordHash !== password) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Tage
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
