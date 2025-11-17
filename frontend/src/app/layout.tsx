import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TopNav } from '@/components/TopNav'
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
    <html lang="en">
      <body className={inter.variable}>
        <TopNav />
        <ClientLayout>{children}</ClientLayout>
        <ToastProvider />
      </body>
    </html>
  )
}
