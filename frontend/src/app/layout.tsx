import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypt | AI-Powered Trading Analytics",
  description: "Advanced AI trading platform with multi-agent analysis, real-time market data, and intelligent recommendations",
  keywords: "trading, AI, crypto, stocks, analytics, portfolio, predictions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0d1117" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
