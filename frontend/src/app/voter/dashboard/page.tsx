'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/libs/api'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Candidate, VotingPeriodResponse, WinnerResponse } from '@/types/api'

interface Winner {
  id: number
  name: string
  voteCount: number
}

export default function VoterDashboard() {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [votingPeriod, setVotingPeriod] = useState<VotingPeriodResponse | null>(null)
  const [winner, setWinner] = useState<Winner | null>(null)

  const fetchDashboardData = async () => {
    try {
      // Fetch candidates
      const candidatesData = await api.getAllCandidates()
      setCandidates(candidatesData)

      // Fetch voting period
      const votingPeriodData = await api.getVotingPeriod()
      setVotingPeriod(votingPeriodData)

      // If voting period has ended, fetch winner
      if (votingPeriodData?.hasEnded) {
        try {
          const winnerData = await api.getWinner('')
          setWinner(winnerData.winner)
        } catch (error) {
          console.error('Error fetching winner:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  useEffect(() => {
    if (!loading && isAdmin) {
      router.push('/admin/dashboard')
    }
  }, [isAdmin, loading, router])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Voter Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the election system.</p>
      </div>

      {/* Voting Period Status */}
      <Card className="p-6 bg-white rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Election Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`px-2 py-1 rounded-full text-sm ${
              !votingPeriod?.isSet 
                ? 'bg-yellow-100 text-yellow-800'
                : votingPeriod.isActive 
                  ? 'bg-green-100 text-green-800'
                  : votingPeriod.hasEnded 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
            }`}>
              {!votingPeriod?.isSet 
                ? 'Not Set'
                : votingPeriod.isActive 
                  ? 'Active'
                  : votingPeriod.hasEnded 
                    ? 'Ended'
                    : 'Pending'}
            </span>
          </div>
          {votingPeriod?.isSet && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Start Time</span>
                <span className="text-sm text-gray-900">
                  {new Date(votingPeriod.startTime * 1000).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">End Time</span>
                <span className="text-sm text-gray-900">
                  {new Date(votingPeriod.endTime * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Winner Display Section */}
      {winner && (
        <Card className="mb-8 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Election Winner</h3>
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <h4 className="text-xl font-bold text-purple-900">{winner.name}</h4>
              <p className="text-sm text-purple-700">Total Votes: {winner.voteCount}</p>
            </div>
            <div className="text-4xl font-bold text-purple-500">🏆</div>
          </div>
        </Card>
      )}

      {/* Candidates List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Candidates</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="p-4">
              <div className="aspect-square relative mb-4">
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${candidate.imageCID}`}
                  alt={candidate.name}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
              <p className="text-sm text-gray-600">Votes: {candidate.voteCount}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
