import type { NextConfig } from "next";

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
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
