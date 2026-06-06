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
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!supabase) return null;
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (error || !user || !user.password) return null;

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }: any) {
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
    async session({ session, token }: any) {
      if (!supabase) return session;
      if (session.user) {
        const { data: dbUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", session.user.email)
          .single();
          
        session.user.id = dbUser?.id || token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
