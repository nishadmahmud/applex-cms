/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  images: {
    // Allow your external image domain
    domains: ["www.outletexpense.xyz"],

    // Future-proof pattern control
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.outletexpense.xyz",
        pathname: "/uploads/**",
      },
    ],

    // 🔥 CRITICAL FIX — disables Next.js image optimizer
    // Prevents 402 (Payment Required) on live hosting
    unoptimized: true,
  },
};

export default nextConfig;
