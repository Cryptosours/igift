import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@realdeal/ui", "@realdeal/schemas", "@realdeal/utils"],
};

export default nextConfig;
