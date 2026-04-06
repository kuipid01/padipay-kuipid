import type { Metadata } from "next";
import { Geist, Libre_Baskerville, Nunito, Roboto_Slab } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});
const robotoSlab = Roboto_Slab({
  variable: "--font-robotoSlab",
  subsets: ["latin"],
});
const libreBaskerville = Libre_Baskerville({
  variable: "--font-libreBaskerville",
  subsets: ["latin"],
});

import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "MyCashNG | Peer-to-Peer Lending Infrastructure",
  description: "Peer-to-peer lending infrastructure for lenders and borrowers in Nigeria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${nunito.variable} ${robotoSlab.variable} ${libreBaskerville.variable} font-nunito`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
