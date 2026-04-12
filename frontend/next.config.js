/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:8001/api/v1/:path*',
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix pdfjs-dist Object.defineProperty error in Webpack 5 / Next.js 15
      config.resolve.alias.canvas = false;
      // Allow Webpack to auto-detect CJS/ESM for pdfjs-dist .mjs files
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      });
    }
    return config;
  },
}

module.exports = nextConfig
