import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elara AI - Your virtual girlfriend",
  description: "Elara AI - your virtual girlfriend and certified cuddle-buddy in the digital world",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Elara AI",
    description: "Elara AI - your virtual girlfriend and certified cuddle-buddy in the digital world",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elara AI",
    description: "Elara AI - your virtual girlfriend and certified cuddle-buddy in the digital world",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
