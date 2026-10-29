import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoroDoc Dashboard — Stellar Soroban Contract Documentation",
  description: "Inspect, explore and generate human-readable documentation and typed interfaces from Soroban smart contracts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
