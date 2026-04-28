import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Link Motion — Agence LinkedIn B2B",
  description:
    "Link Motion accompagne les dirigeants et experts B2B dans la création d'un système de contenu LinkedIn conçu pour attirer, engager et convertir les bons clients.",
  keywords: "ghostwriting LinkedIn, agence LinkedIn B2B, contenu LinkedIn, acquisition client LinkedIn, personal branding B2B",
  openGraph: {
    title: "Link Motion — Transformez LinkedIn en canal d'acquisition client",
    description:
      "Stratégie de contenu, ghostwriting et acquisition client LinkedIn pour dirigeants et experts B2B.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
