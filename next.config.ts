import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  turbopack: {
    root: ".",
  },
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js", "vexflow"],
  },
};

export default nextConfig;
