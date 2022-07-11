/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    // Replace React with Preact only in client production build
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      });
    }

    return config;
  },
  images: {
    domains: ['cdn.warframestat.us'],
    // high TTL: do not expect warframe images to change
    minimumCacheTTL: 604800,
  },
  experimental: {
    images: {
      layoutRaw: true,
    },
  },
};

module.exports = nextConfig;
