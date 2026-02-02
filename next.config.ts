import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // When served under a subpath (e.g. nginx proxy at /ui/), set NEXT_PUBLIC_BASE_PATH=/ui
  // so router.replace('/contracts?...') goes to /ui/contracts?... instead of /contracts?...
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
};

export default nextConfig;
