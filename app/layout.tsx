import type React from "react"

import type { Metadata } from "next"
import { Figtree, Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.disclaw.online'),
  title: 'DISCLAW - Whale Tracker & Signal Caller',
  description: 'Whale wallet tracking and policy-driven signal calling for Solana tokens. Follow the smart money and automate your Discord calls.',
  generator: 'DISCLAW',
  icons: {
    icon: '/disclaw-logo.png',
    apple: '/disclaw-logo.png',
  },
  openGraph: {
    title: 'DISCLAW - Whale Tracker & Signal Caller',
    description: 'Whale wallet tracking and policy-driven signal calling for Solana tokens. Follow the smart money and automate your Discord calls.',
    images: ['/disclaw-banner.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DISCLAW - Whale Tracker & Signal Caller',
    description: 'Whale wallet tracking and signal calling for Solana.',
    images: ['/disclaw-banner.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${figtree.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
