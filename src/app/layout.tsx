import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "isiQuint — Farbige Notenlinien für Geigenanfänger",
  description:
    "Erstelle, visualisiere und teile Partituren mit farbigen Notenlinien nach der isiQuint-Methode von Regine Bubeck-Cinus.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#C0392B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#C0392B] focus:text-white focus:rounded-lg focus:font-medium"
        >
          Zum Hauptinhalt springen
        </a>
        {children}
      </body>
    </html>
  );
}
