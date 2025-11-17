import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Coins, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Width */}
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] min-h-[600px] py-20 text-white overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ 
            transform: 'scale(1.1)',
            filter: 'brightness(0.85) contrast(1.1)',
          }}
        >
          <source src="/bgvideo.mp4" type="video/mp4" />
          <source src="/bgvideo.webm" type="video/webm" />
        </video>
        
        {/* Subtle overlay for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/50 via-teal-600/40 to-primary-700/50"></div>
        
        <div className="relative mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl drop-shadow-2xl">
              Pollu-Stake
            </h1>
            <p className="mb-4 text-2xl font-semibold text-white sm:text-3xl drop-shadow-lg">
              On-Chain Environmental Compliance
            </p>
            <p className="mx-auto mb-10 max-w-3xl text-lg text-white/95 sm:text-xl drop-shadow-lg">
              Stake, forecast, and earn GreenCredits through AI-powered environmental monitoring.
              A decentralized platform ensuring factory compliance with transparent governance.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/admin">
                <button 
                  className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-lg font-medium text-primary-700 shadow-2xl transition-all hover:bg-teal-50 hover:shadow-xl hover:scale-105"
                >
                  <Shield className="h-5 w-5" />
                  Admin Portal
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <Link href="/factory">
                <button 
                  className="flex items-center gap-2 rounded-lg border-2 border-white bg-white/10 backdrop-blur-sm px-6 py-3 text-lg font-medium text-white shadow-2xl transition-all hover:bg-white hover:text-primary-700 hover:shadow-xl hover:scale-105"
                >
                  <Coins className="h-5 w-5" />
                  Factory Portal
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-charcoal-900">How Pollu-Stake Works</h2>
            <p className="mx-auto max-w-2xl text-lg text-charcoal-600">
              A transparent, AI-powered system for environmental compliance
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card hover className="text-center">
              <CardContent className="flex flex-col items-center pt-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                  <Coins className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-charcoal-900">1. Stake ETH</h3>
                <p className="text-charcoal-600">
                  Factories stake ETH to receive a License NFT and demonstrate commitment to compliance
                </p>
              </CardContent>
            </Card>

            <Card hover className="text-center">
              <CardContent className="flex flex-col items-center pt-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100">
                  <TrendingUp className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-charcoal-900">2. AI Forecast</h3>
                <p className="text-charcoal-600">
                  Machine learning models predict pollution levels with high confidence intervals
                </p>
              </CardContent>
            </Card>

            <Card hover className="text-center">
              <CardContent className="flex flex-col items-center pt-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-charcoal-900">3. Oracle Slash</h3>
                <p className="text-charcoal-600">
                  Predicted violations trigger automatic stake slashing, funding the DAO treasury
                </p>
              </CardContent>
            </Card>

            <Card hover className="text-center">
              <CardContent className="flex flex-col items-center pt-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-charcoal-900">4. Earn Credits</h3>
                <p className="text-charcoal-600">
                  Compliant factories earn GreenCredits, tradeable tokens representing verified clean operations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-charcoal-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-charcoal-900">Platform Features</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Factory Dashboard</CardTitle>
                <CardDescription>Comprehensive tools for factory operators</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-charcoal-700">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600">✓</span>
                    Real-time stake management and license NFT tracking
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600">✓</span>
                    Live AI forecast alerts with confidence scores
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600">✓</span>
                    Slash history and remediation guidance
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600">✓</span>
                    Compliance checklists and action items
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin & DAO Portal</CardTitle>
                <CardDescription>Governance and treasury management</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-charcoal-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600">✓</span>
                    Monitor all factories with risk-based alerts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600">✓</span>
                    Slash event tracking and treasury oversight
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600">✓</span>
                    Mint and distribute GreenCredits
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600">✓</span>
                    DAO proposal voting and governance
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-charcoal-900">
            Ready to Experience the Demo?
          </h2>
          <p className="mb-8 text-lg text-charcoal-600">
            Explore our fully functional demo showcasing the complete staking, forecasting, and
            rewards flow.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/admin">
              <Button size="lg" variant="secondary" className="gap-2">
                <Shield className="h-5 w-5" />
                View Admin Dashboard
              </Button>
            </Link>
            <Link href="/factory">
              <Button size="lg" className="gap-2">
                <Coins className="h-5 w-5" />
                View Factory Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-charcoal-200 bg-white px-4 py-8 text-center text-sm text-charcoal-600">
        <p>© 2024 Pollu-Stake. Built for HackBios — Demo Mode Active</p>
        <p className="mt-2">
          All transactions are mocked for demonstration purposes. Connect wallet to explore the full UI.
        </p>
      </footer>
    </div>
  )
}
