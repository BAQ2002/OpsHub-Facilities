import type { NextConfig } from "next";

const backendUrl = (process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

const nextConfig: NextConfig = {
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
