import type { NextConfig } from "next";
import { hostname, networkInterfaces } from "node:os";

const backendUrl = (process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const configuredDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const localNetworkOrigins = Object.values(networkInterfaces())
  .flatMap((interfaces) => interfaces ?? [])
  .filter((networkInterface) => networkInterface.family === "IPv4")
  .map((networkInterface) => networkInterface.address);
const allowedDevOrigins = [
  "localhost",
  hostname(),
  ...localNetworkOrigins,
  ...configuredDevOrigins,
].filter((origin, index, origins) => origins.indexOf(origin) === index);

const nextConfig: NextConfig = {
  allowedDevOrigins,
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
      allowedOrigins: configuredDevOrigins,
    },
  },
};

export default nextConfig;
