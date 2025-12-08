import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
    ],
  },
  turbopack: {
    root: '/Users/ino/project/react/padot_movie_awards',
  },
};

export default nextConfig;
