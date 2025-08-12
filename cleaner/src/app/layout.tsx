import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PropertySanta Cleaner - Mobile Task Management',
  description: 'Mobile-first cleaning task management platform for professional cleaners.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PropertySanta Cleaner" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 