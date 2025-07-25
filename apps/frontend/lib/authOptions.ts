import { AuthOptions } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import GitHubProvider, { GithubProfile } from "next-auth/providers/github";
import { AppUserModel, dbConnect } from "@dataflow-ide/dataflow-backend";
import { v4 } from "uuid";

export const authOptions: AuthOptions = {
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
        async signIn({ user, account }) {
            await dbConnect();

            const provider = account?.provider;
            const existingUser = await AppUserModel.findOne({ provider, providerId: user.id });

            if (!existingUser) {
                await AppUserModel.create({
                    id: v4(),
                    provider,
                    providerId: user.id
                });
            }

            return true;
        },
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
            await dbConnect();

            session.user.providerId = token.id;
            session.provider = token.provider as string;

            const user = await AppUserModel.findOne({ provider: session.provider, providerId: session.user.providerId });
            session.user.id = user?.id;

            return session;
        }
    }
};
