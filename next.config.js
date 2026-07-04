/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  webpack: (config, { dev, isServer }) => {
    // Disable filesystem cache in both dev and prod — with 195+ pages the
    // webpack cache worker exhausts the libuv threadpool (EAGAIN on readdir).
    config.cache = false;

    // Limit parallel workers to avoid concurrent readdir overload.
    config.parallelism = 1;

    if (config.snapshot) {
      config.snapshot.managedPaths = [];
      config.snapshot.immutablePaths = [];
    }

    return config;
  },
};

module.exports = nextConfig;
