import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // strict mode is important to creat app with less bugs
  reactStrictMode: true,
  
  async rewrites() {
    return [
      {
        source: '/dashboard',
        destination: '/',
      },
    ]
  },
};

export default nextConfig;
