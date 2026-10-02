import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

// Next.js normally loads env files from the repository root.
// Force a reload from app/ before resolving the API URL and media rewrites.
loadEnvConfig(path.join(process.cwd(), "app"), process.env.NODE_ENV === "development", console, true);

const backendUrl = (process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const configuredDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  allowedDevOrigins: configuredDevOrigins,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "same-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
  async redirects() {
    return [
      { source: "/", destination: "/pages/home", permanent: true },
      {
        source: "/acompanhamento-atividades",
        destination: "/pages/chamados/dashboard",
        permanent: true,
      },
      {
        source: "/acompanhamento-atividades/requests",
        destination: "/pages/chamados/kanbanboard",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/service-catalog/media/:id",
        destination: `${backendUrl}/api/v1/service-catalog/media/:id`,
      },
      {
        source: "/api/v1/request-tasks/media/:id",
        destination: `${backendUrl}/api/v1/request-tasks/media/:id`,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
