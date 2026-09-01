import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/", destination: "/home", permanent: true },
      {
        source: "/acompanhamento-atividades",
        destination: "/chamados/dashboard",
        permanent: true,
      },
      {
        source: "/acompanhamento-atividades/requests",
        destination: "/chamados/kanbanboard",
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
