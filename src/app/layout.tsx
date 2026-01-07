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

const NAV_HEIGHT = 64;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        
        <main
          style={{
            flex: 1,
            padding: "2rem 1.5rem",
            maxWidth: "600px",
            width: "100%",

            marginLeft: "auto",
            marginRight: "auto",

            paddingBottom: "96px",
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
            height: NAV_HEIGHT,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            backdropFilter: "blur(6px)",
          }}
        >
          <NavLink href="/transactions">Transactions</NavLink>
        </nav>
      </body>
    </html>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "var(--foreground)",
        fontWeight: 600,
        fontSize: "0.95rem",
        padding: "0.5rem 0.75rem",
        borderRadius: "10px",
      }}
    >
      {children}
    </Link>
  );
}