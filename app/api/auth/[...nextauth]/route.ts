import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" }
      },
      async authorize(credentials) {
        if (!supabase) {
          console.error("[auth][error] Supabase not initialized");
          return null;
        }
        if (!credentials?.email || !credentials?.password) {
          console.error("[auth][error] Missing email or password");
          return null;
        }

        console.log(`[auth][attempt] Logging in: ${credentials.email}`);

        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (error) {
          console.error(`[auth][error] Supabase error: ${error.message}`);
          return null;
        }
        if (!user) {
          console.error(`[auth][error] User not found: ${credentials.email}`);
          return null;
        }
        if (!user.password) {
          console.error(`[auth][error] User found but no password stored`);
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          console.error(`[auth][error] Password mismatch for: ${credentials.email}`);
          return null;
        }

        console.log(`[auth][success] User ${user.email} authorized`);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          rememberMe: credentials.rememberMe === "true"
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      console.log(`[auth][signIn] Attempting sign in for: ${user.email} via ${account?.provider}`);
      if (!supabase) return false;
      if (account.provider === "google") {
        if (!user.email) return false;
        try {
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();

          if (!existingUser) {
            console.log(`[auth][signIn] Creating new Google user: ${user.email}`);
            await supabase.from("users").insert({
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image
            });
          }
          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.rememberMe = user.rememberMe;
      }
      if (token.rememberMe === false) {
         token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };