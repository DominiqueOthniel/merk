import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  outputFileTracingIncludes: {
    "/api/exam/**/*": ["./content/exam/**/*"],
    "/api/**/*": ["./content/exam/**/*"],
    "/*": ["./content/exam/**/*"],
    "/**/*": ["./content/exam/**/*"],
  },
};

export default nextConfig;
