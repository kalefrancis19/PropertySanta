import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Firebase hosting
  output: 'export',
  trailingSlash: true,
  
  // Configure images for dynamic usage
  images: {
    domains: ['localhost'],
    unoptimized: false
  },
  
  // Keep build optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Add environment variable handling
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  
  /* config options here */
};

export default nextConfig;
