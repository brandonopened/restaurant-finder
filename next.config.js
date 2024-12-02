/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com",
            },
          ],
        },
      ]
    },
  }
  
  module.exports = nextConfig