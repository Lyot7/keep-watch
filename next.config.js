/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: process.env.NODE_ENV === "production",
  images: {
    domains: ["i.ytimg.com"],
    unoptimized: process.env.NODE_ENV === "development",
  },
  output: "standalone",

  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcrypt"],
    optimizeCss: process.env.NODE_ENV === "production",
  },

  // This will make Next.js bind to all available network interfaces
  webpack: (config) => {
    return config;
  },

  sassOptions: {
    includePaths: ["./src"],
  },

  pageExtensions: ["tsx", "ts"],

  optimizeFonts: process.env.NODE_ENV === "production",

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
