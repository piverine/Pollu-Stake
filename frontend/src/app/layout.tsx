import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { TopNav } from '@/components/TopNav'
import { ChatBot } from '@/components/ChatBot'
import { ToastProvider } from '@/components/ToastProvider'
import { ClientLayout } from './ClientLayout'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Pollu-Stake | Environmental Compliance & Green Credits',
  description:
    'On-chain environmental staking platform with AI-powered forecasting and GreenCredits rewards',
  keywords: ['blockchain', 'environment', 'compliance', 'staking', 'green credits'],
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.variable}>
          <TopNav />
          <ClientLayout>{children}</ClientLayout>
          <ChatBot />
          <ToastProvider />
        </body>
      </html>
    </ClerkProvider>
  )
}
