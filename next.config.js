/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["ipfs.infura.io"],
  },
  webpack5: false,
};

module.exports = nextConfig;
