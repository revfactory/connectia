import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { TRPCProvider } from '@/components/providers/trpc-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Connectia',
  description: 'Connect with friends and the world around you on Connectia.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <TRPCProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
