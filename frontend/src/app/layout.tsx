"use client"

import type { Metadata } from "next";
import "./globals.css";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    document.documentElement.classList.add('dark'); // Forcer le dark mode
  }, []);
  return (
    <html lang="en">
      <body className="bg-background">
        {children}
      </body>
    </html>
  );
}
