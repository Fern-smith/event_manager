/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "img.evbuc.com"
      }
    ]
  },
  webpack: (config) => {
    config.resolve.extension.push(".js", "jsx");
    return config;
  }
};

module.exports = nextConfig;
