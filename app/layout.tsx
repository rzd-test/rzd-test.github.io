import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import { ThemeProvider } from "@/contexts/theme-context"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Методичка РЖД",
  description: "Система управления персоналом и документацией РЖД",
  icons: {
    icon: "/favicon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
