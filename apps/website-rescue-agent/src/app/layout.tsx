import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Website Rescue Agent — Lucello Studio",
  description: "Internes KI-gestütztes Tool für Website-Analyse und Akquise",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="de" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {session ? (
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header user={session.user} />
              <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                {children}
              </main>
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-background">{children}</div>
        )}
      </body>
    </html>
  );
}
