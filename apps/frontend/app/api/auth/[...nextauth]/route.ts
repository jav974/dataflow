import NextAuth from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import GitHubProvider, { GithubProfile } from "next-auth/providers/github";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            },
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (profile) {
                if (account?.provider === "google") {
                    token.id = (profile as GoogleProfile).sub;
                } else if (account?.provider === "github") {
                    token.id = (profile as GithubProfile).id;
                }
                token.provider = account?.provider;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.provider = token.provider as string;
            return session;
        }
    }
});

export { handler as GET, handler as POST }
