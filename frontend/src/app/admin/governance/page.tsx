'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MOCK_PROPOSALS } from '@/services/mockData'
import { Vote, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function GovernancePage() {
  const [proposals, setProposals] = useState(MOCK_PROPOSALS)

  const handleVote = (proposalId: string, voteType: 'for' | 'against' | 'abstain') => {
    setProposals(
      proposals.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            votesFor: voteType === 'for' ? p.votesFor + 1 : p.votesFor,
            votesAgainst: voteType === 'against' ? p.votesAgainst + 1 : p.votesAgainst,
            votesAbstain: voteType === 'abstain' ? p.votesAbstain + 1 : p.votesAbstain,
          }
        }
        return p
      })
    )
    toast.success(`Vote recorded: ${voteType}`)
  }

  const activeProposals = proposals.filter((p) => p.status === 'active')
  const passedProposals = proposals.filter((p) => p.status === 'passed')
  const rejectedProposals = proposals.filter((p) => p.status === 'rejected')

  return (
    <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">DAO Governance</h1>
          <p className="mt-2 text-charcoal-600">Decentralized decision-making and proposals</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Total Proposals</p>
                  <p className="mt-1 text-2xl font-bold text-charcoal-900">{proposals.length}</p>
                </div>
                <Vote className="h-10 w-10 text-primary-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Active</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">{activeProposals.length}</p>
                </div>
                <MinusCircle className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Passed</p>
                  <p className="mt-1 text-2xl font-bold text-green-600">{passedProposals.length}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Rejected</p>
                  <p className="mt-1 text-2xl font-bold text-red-600">{rejectedProposals.length}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Proposals */}
        {activeProposals.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Active Proposals</CardTitle>
              <CardDescription>Vote on current proposals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="rounded-xl border border-charcoal-200 p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-charcoal-900">{proposal.title}</h4>
                          <Badge variant="info">{proposal.status}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-charcoal-600">{proposal.description}</p>
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span className="text-primary-600">
                            For: <strong>{proposal.votesFor}</strong>
                          </span>
                          <span className="text-red-600">
                            Against: <strong>{proposal.votesAgainst}</strong>
                          </span>
                          <span className="text-charcoal-500">
                            Abstain: <strong>{proposal.votesAbstain}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => handleVote(proposal.id, 'for')}>
                        Vote For
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleVote(proposal.id, 'against')}
                      >
                        Vote Against
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVote(proposal.id, 'abstain')}
                      >
                        Abstain
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Proposals */}
        <Card>
          <CardHeader>
            <CardTitle>All Proposals</CardTitle>
            <CardDescription>Complete proposal history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="rounded-xl border border-charcoal-200 p-4 hover:bg-charcoal-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-charcoal-900">{proposal.title}</h4>
                        <Badge
                          variant={
                            proposal.status === 'passed'
                              ? 'success'
                              : proposal.status === 'active'
                              ? 'info'
                              : 'default'
                          }
                        >
                          {proposal.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-charcoal-600">{proposal.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="text-primary-600">
                          For: <strong>{proposal.votesFor}</strong>
                        </span>
                        <span className="text-red-600">
                          Against: <strong>{proposal.votesAgainst}</strong>
                        </span>
                        <span className="text-charcoal-500">
                          Abstain: <strong>{proposal.votesAbstain}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  {proposal.status === 'active' && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => handleVote(proposal.id, 'for')}>
                        Vote For
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleVote(proposal.id, 'against')}
                      >
                        Vote Against
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVote(proposal.id, 'abstain')}
                      >
                        Abstain
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
