import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "SolWill - Decentralized Crypto Inheritance on Solana",
  description:
    "A trustless dead man's switch for crypto inheritance. Deposit SOL, designate beneficiaries, and secure your digital legacy on-chain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#111113] antialiased">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
