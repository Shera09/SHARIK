/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  // Disable static optimization to reduce memory
  generateBuildId: async () => 'build',
};

module.exports = nextConfig;
