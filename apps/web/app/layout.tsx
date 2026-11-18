import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { DirectionProvider } from "@/components/foundations/direction/direction";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cx } from "@/utils/cx";
import "./globals.css";

const sans = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Zeke",
  description: "Zeke watches your stock, asks before it buys, and chases suppliers by email, WhatsApp and phone.",
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html className={cx(sans.variable, mono.variable)} lang="en-US" dir="ltr">
      <body className="font-sans">
        <DirectionProvider locale="en-US">
          <TooltipProvider>{children}</TooltipProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
