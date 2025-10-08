import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "ferf1mheo22r9ira.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
