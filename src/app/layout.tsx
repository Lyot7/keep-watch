import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BackgroundGrid from "./components/BackgroundGrid";
// Only import styles, not globals.css
import "./styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Keep Watch - Veille Tech & Productivité",
  description: "Organisez et suivez les meilleures vidéos YouTube pour votre veille technologique et votre productivité personnelle.",
  keywords: "youtube, veille technologique, productivité, développement, programmation",
  authors: [{ name: "Votre Nom" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased`}>
        <BackgroundGrid />
        {children}
      </body>
    </html>
  );
}
