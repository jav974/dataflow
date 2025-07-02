import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  eslint: {
    dirs: ['app', 'actions'],
  },
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'lh3.googleusercontent.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'avatars.githubusercontent.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'cdn.discordapp.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'pbs.twimg.com',
      pathname: '/**',
    },
  ],
},
transpilePackages: ['@dataflow-ide/dataflow-ui', '@dataflow-ide/dataflow-core'],
};

export default nextConfig;
