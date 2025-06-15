import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  eslint: {
    dirs: ['app', 'actions', 'dataflow'],
  },
};

export default nextConfig;
