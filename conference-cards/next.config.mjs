/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com'],
    // or use remotePatterns if needed for subdomains
    // remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }]
  },
}

export default nextConfig
