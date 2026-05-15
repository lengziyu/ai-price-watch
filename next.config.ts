import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Keep this above our 6MB business-level cover limit so uploads
      // can reach the server action and be validated there.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
