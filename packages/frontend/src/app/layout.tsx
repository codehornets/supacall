import type { Metadata } from 'next'
import AppProvider from './provider'
import "./globals.css"

export const metadata: Metadata = {
  title: 'Nico',
  description: 'Nico Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
