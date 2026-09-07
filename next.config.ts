import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Restrict to the project cloud name — dvucotc8z
        pathname: "/dvucotc8z/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
  // Cap workers on local Windows developer environments to prevent Node.js 24 worker thread memory crashes
  ...(process.platform === "win32" && !process.env.VERCEL
    ? {
        experimental: {
          cpus: 1,
          workerThreads: false,
        },
      }
    : {}),
};

export default nextConfig;
