import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Iver Macaulay | Software Engineer",
  description: "Software engineer delivering integrations, data pipelines, and dashboards for e-commerce, manufacturing, and operations",
  keywords: ["Software Engineer", "Python", "TypeScript", "Web Development", "APIs", "Integrations"],
  authors: [{ name: "Iver Macaulay" }],
  openGraph: {
    title: "Iver Macaulay | Software Engineer",
    description: "Portfolio of Iver Macaulay - Software Engineer",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
