import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Locations de bornes",
  description: "Suivi interne des locations de bornes électriques",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ background: "var(--color-bg)" }}>
        {children}
      </body>
    </html>
  );
}
