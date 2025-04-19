'use client'

import { useState, useEffect } from 'react'
import { api } from '@/libs/api'
import type { Candidate } from '@/libs/api'
import { Card } from "@/components/ui/card"
import { ImageIcon } from "@/components/ui/icons"
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        setLoading(true)
        const candidateData = await api.getCandidateDetails(Number(params.id))
        setCandidate(candidateData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidate')
      } finally {
        setLoading(false)
      }
    }

    loadCandidate()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg">Candidate not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Candidates
          </Button>
        </div>
        <Card className="overflow-hidden">
          <div className="relative w-full h-96">
            {candidate.imageCID ? (
              <Image
                src={`https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${candidate.imageCID}`}
                alt={candidate.name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No image available</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{candidate.name}</h1>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground">Vote Count</h3>
                <p className="text-2xl font-bold mt-1">{candidate.voteCount}</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground">Candidate ID</h3>
                <p className="text-sm font-mono mt-1">{candidate.id}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 