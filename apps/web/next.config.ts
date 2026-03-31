import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@realdeal/ui", "@realdeal/schemas", "@realdeal/utils"],
};

export default nextConfig;
