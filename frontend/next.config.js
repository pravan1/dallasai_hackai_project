const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    // Ensure webpack resolves modules from the frontend's own node_modules first,
    // preventing conflicts when there is also a root-level node_modules.
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ]
    return config
  },
}

module.exports = nextConfig
