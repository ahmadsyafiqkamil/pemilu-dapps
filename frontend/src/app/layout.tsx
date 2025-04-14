import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { headers } from 'next/headers'
import Providers from './provider'
import { Navbar } from '@/components/Navbar'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-Voting App',
  description: 'Secure electronic voting system',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookie = (await headers()).get('cookie')

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers cookie={cookie}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {/* Page Content */}
            <main className="flex-1 px-6 py-8 bg-muted/5">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
