import type { Metadata } from "next";
import { GeistSans, GeistMono } from 'geist/font'
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { Suspense } from "react";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "Card JSON",
  description: "Create json for MoEngage Cards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <Suspense fallback={null}>
          <Providers>
            {children}
          </Providers>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
