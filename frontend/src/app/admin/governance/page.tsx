'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Vote, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Proposal {
  id: string
  title: string
  description: string
  status: string
  votesFor: number
  votesAgainst: number
  votesAbstain: number
  createdAt?: string
}

export default function GovernancePage() {
  const { user } = useUser()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, 'for' | 'against' | 'abstain'>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)

  // Fetch proposals from backend
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dao-proposals')
        if (!response.ok) throw new Error('Failed to fetch proposals')
        const data = await response.json()
        setProposals(data.proposals || [])
      } catch (error) {
        console.error('Error fetching proposals:', error)
        toast.error('Failed to load proposals')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProposals()
  }, [])

  // Fetch user's votes from backend
  useEffect(() => {
    if (!user?.id) return

    const fetchUserVotes = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/user-votes/${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch user votes')
        const data = await response.json()
        
        const votesMap: Record<string, 'for' | 'against' | 'abstain'> = {}
        data.votes?.forEach((vote: any) => {
          votesMap[vote.proposalId] = vote.voteType
        })
        setUserVotes(votesMap)
      } catch (error) {
        console.error('Error fetching user votes:', error)
      }
    }

    fetchUserVotes()
  }, [user?.id])

  const handleVote = async (proposalId: string, voteType: 'for' | 'against' | 'abstain') => {
    // Check if user has already voted on this proposal
    if (userVotes[proposalId]) {
      toast.error(`You have already voted on this proposal. Your vote: ${userVotes[proposalId]}`)
      return
    }

    if (!user?.id) {
      toast.error('Please sign in to vote')
      return
    }

    setIsVoting(true)
    try {
      const response = await fetch('http://localhost:8000/api/dao-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          userId: user.id,
          voteType,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to record vote')
      }

      // Update local state
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

      // Record user's vote
      setUserVotes({
        ...userVotes,
        [proposalId]: voteType,
      })

      toast.success(`Vote recorded: ${voteType}`)
    } catch (error: any) {
      console.error('Error voting:', error)
      toast.error(error.message || 'Failed to record vote')
    } finally {
      setIsVoting(false)
    }
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
                    <div className="mt-4 space-y-3">
                      {userVotes[proposal.id] ? (
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 border border-green-200">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            You voted: <strong className="capitalize">{userVotes[proposal.id]}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleVote(proposal.id, 'for')}
                            isLoading={isVoting}
                            disabled={isVoting}
                          >
                            Vote For
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleVote(proposal.id, 'against')}
                            isLoading={isVoting}
                            disabled={isVoting}
                          >
                            Vote Against
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVote(proposal.id, 'abstain')}
                            isLoading={isVoting}
                            disabled={isVoting}
                          >
                            Abstain
                          </Button>
                        </div>
                      )}
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
                    <div className="mt-4 space-y-3">
                      {userVotes[proposal.id] ? (
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 border border-green-200">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            You voted: <strong className="capitalize">{userVotes[proposal.id]}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleVote(proposal.id, 'for')}
                            isLoading={isVoting}
                            disabled={isVoting}
                          >
                            Vote For
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleVote(proposal.id, 'against')}
                            isLoading={isVoting}
                            disabled={isVoting}
                          >
                            Vote Against
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVote(proposal.id, 'abstain')}
                            isLoading={isVoting}
                            disabled={isVoting}
                          >
                            Abstain
                          </Button>
                        </div>
                      )}
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
