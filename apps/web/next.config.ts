import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "chimp-pick",
  project: "chimp-pick-web",
});
