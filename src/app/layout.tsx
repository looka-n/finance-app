import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "A minimalist personal finance tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main
          style={{
            flex: 1,
            padding: "2rem 1.5rem",
            margin: "0 auto",
            maxWidth: "600px", // ✅ limits width for large screens
            width: "100%",
            marginBottom: "60px", // space above navbar
          }}
        >
          {children}
        </main>
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "1rem 0",
            background: "#f5f5f5",
            borderTop: "1px solid #ddd",
          }}
        >
          <Link href="/">Home</Link>
          <Link href="/transactions">Transactions</Link>
          <Link href="/budgets">Budgets</Link>
        </nav>
      </body>
    </html>
  );
}
