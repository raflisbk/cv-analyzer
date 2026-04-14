/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:8000/api/v1/:path*',
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix pdfjs-dist with Next.js 15
      config.resolve.alias.canvas = false;

      // Handle pdfjs-dist ES modules
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      });
    }
    return config;
  },
}

module.exports = nextConfig
