import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    provider: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}