/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.warframestat.us'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 604800
  },
  // for my private website, remove if desired
  basePath: "/warframe-tracker"
};

module.exports = nextConfig;
