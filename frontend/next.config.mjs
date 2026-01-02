/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Exclude /api/nango/session - it has its own API route
      {
        source: '/api/config/:path*',
        destination: 'http://127.0.0.1:8000/config/:path*',
      },
      {
        source: '/api/playbook',
        destination: 'http://127.0.0.1:8000/playbook',
      },
      {
        source: '/api/config/pulse-check',
        destination: 'http://127.0.0.1:8000/config/pulse-check',
      },
      // /api/nango/session is handled by frontend/src/app/api/nango/session/route.ts
    ];
  },
};

export default nextConfig;

