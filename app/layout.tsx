import type { Metadata } from "next";
import Sidebar from "@/shared/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpsHub Facilities",
  description: "Sistema de gestão operacional",
};

/**
 * Acionada pelo Next.js para envolver a renderização das rotas da aplicação.
 *
 * Define a estrutura visual compartilhada por todas as páginas da aplicação.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className="h-full antialiased"
    >
      <body>
        <div data-ui="app-shell" className="app-shell">
          <Sidebar />

          <main data-ui="app-content" className="app-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
