import type { Metadata } from "next";
import Sidebar from "../components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpsHub Facilities",
  description: "Sistema de gestão operacional",
};

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
        <div className="app-shell">
          <Sidebar />

          <main className="app-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}