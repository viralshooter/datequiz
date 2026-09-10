import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The share-card renderer reads the Geist files from disk at request
  // time. Nothing imports them, so the build's dependency tracing has no
  // way to know they're needed and leaves them out of the function bundle
  // — the card then 500s in production while building fine locally.
  outputFileTracingIncludes: {
    "/d/[slug]/opengraph-image": ["./src/assets/fonts/**"],
    "/opengraph-image": ["./src/assets/fonts/**"],
  },
};

export default nextConfig;
