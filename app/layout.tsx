import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import BottomNavigation from "@/components/bottom-navigation"
import { AuthProvider } from "@/contexts/AuthContext"
import { PlacesProvider } from "@/contexts/PlacesContext"
import { LocationProvider } from "@/contexts/LocationContext"
import { KeywordRecommendProvider } from '@/contexts/KeywordRecommendContext'
import { LocationRecommendProvider } from '@/contexts/LocationRecommendContext'
import { SelfRecommendProvider } from '@/contexts/SelfRecommendContext'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "카페 감수광",
  description: "A mobile application with Kakao Map integration",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen h-screen`}>
        <AuthProvider>
          <LocationProvider>
            <PlacesProvider>
              <LocationRecommendProvider>
                <KeywordRecommendProvider>
                  <SelfRecommendProvider>
                    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
                      <main className="relative overflow-y-auto h-[calc(100vh-4rem)]">{children}</main>
                      <BottomNavigation />
                    </ThemeProvider>
                  </SelfRecommendProvider>
                </KeywordRecommendProvider>
              </LocationRecommendProvider>
            </PlacesProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
