/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'cyan-electoral-perch-838.mypinata.cloud',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig
