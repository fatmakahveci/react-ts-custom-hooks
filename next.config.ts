import type { NextConfig } from "next";

const config: NextConfig = {
  // Keep normal Next development; only the Sites pipeline emits a static export.
  ...(process.env.SITES_EXPORT === "true"
    ? { output: "export" as const, pageExtensions: ["tsx"] }
    : {}),
};

export default config;
