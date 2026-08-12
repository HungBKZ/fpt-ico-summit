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
};

export default nextConfig;
