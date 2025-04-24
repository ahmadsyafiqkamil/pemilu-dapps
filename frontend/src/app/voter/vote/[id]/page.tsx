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
import { toast } from 'sonner'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'

export default function CandidateDetailPage() {
    const { address } = useAccount()
    const { data: walletClient } = useWalletClient()
    const publicClient = usePublicClient()
    const params = useParams()
    const router = useRouter()
    const [candidate, setCandidate] = useState<Candidate | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isVoting, setIsVoting] = useState(false)

    useEffect(() => {
        loadCandidate()
    }, [params.id])

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

    const handleVote = async () => {
        if (!address || !walletClient || !publicClient || !candidate) {
            toast.error('Please connect your wallet first')
            return
        }

        setIsVoting(true)
        setError(null)

        try {
            // TODO: Implement voting logic here
            // This will be implemented when the backend API is ready
            toast.success('Vote recorded successfully!')
            router.push('/voter/dashboard')
        } catch (err) {
            console.error('Error voting:', err)
            setError(err instanceof Error ? err.message : 'Failed to submit vote')
            toast.error('Failed to submit vote')
        } finally {
            setIsVoting(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                        Back
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
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">About the Candidate</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {/* TODO: Add more candidate details when available in the API */}
                                    Click the Vote button to cast your vote for this candidate.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                onClick={handleVote}
                                disabled={isVoting}
                                className="w-full"
                            >
                                {isVoting ? 'Voting...' : 'Vote for this Candidate'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
