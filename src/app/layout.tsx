import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarbonProof (CausalMRV) — IEEE ClimateChain 2026",
  description:
    "Offline Synthetic Control Econometric Verification, Dynamic Buffer Slashing & Dual-Tranche ERC-1155 Settlement Plane. Track 1 Submission.",
  keywords: ["CarbonProof", "CausalMRV", "Synthetic Control", "IEEE ClimateChain", "REDD+", "Kariba VCS 902", "ERC1155", "EIP712"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#040709] text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
