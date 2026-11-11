import type { NextConfig } from "next";

// The browser calls /api on this origin and Next.js forwards it to the
// backend, so the backend needs no CORS.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // For the Docker image (see Dockerfile); `next start` and Vercel ignore it.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
