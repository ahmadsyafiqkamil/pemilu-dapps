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
    const [voterStatus, setVoterStatus] = useState<{
        isRegistered: boolean;
        hasVoted: boolean;
        voteCandidateId: number;
    } | null>(null)

    useEffect(() => {
        loadCandidate()
        if (address) {
            checkVoterStatus()
        }
    }, [params.id, address])

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

    const checkVoterStatus = async () => {
        if (!address) return
        
        try {
            const status = await api.checkVoterStatus(address)
            setVoterStatus({
                isRegistered: status.is_registered,
                hasVoted: status.has_voted,
                voteCandidateId: status.vote_candidate_id
            })
        } catch (err) {
            console.error('Error checking voter status:', err)
        }
    }

    const handleVote = async () => {
        if (!address || !walletClient || !publicClient || !candidate) {
            toast.error('Please connect your wallet first')
            return
        }

        if (voterStatus?.hasVoted) {
            toast.error('You have already voted')
            return
        }

        setIsVoting(true)
        setError(null)

        try {
            // Get the transaction from the API
            const response = await api.vote(address, Number(params.id))
            const tx = response.tx_hash
            
            // Sign and send the transaction
            const hash = await walletClient.sendTransaction({
                to: tx.to as `0x${string}`,
                data: tx.data as `0x${string}`,
                value: BigInt(tx.value),
                gas: BigInt(tx.gas),
                maxFeePerGas: BigInt(tx.maxFeePerGas),
                maxPriorityFeePerGas: BigInt(tx.maxPriorityFeePerGas),
                nonce: tx.nonce,
                type: 'eip1559'
            })
            
            // Wait for transaction to be mined
            toast.promise(
                (async () => {
                    const receipt = await publicClient.waitForTransactionReceipt({ hash })
                    if (receipt.status === 'success') {
                        toast.success('Vote recorded successfully!')
                        // Update voter status after successful vote
                        await checkVoterStatus()
                        router.push('/voter/vote')
                    } else {
                        throw new Error('Transaction failed')
                    }
                    return receipt
                })(),
                {
                    loading: 'Processing transaction...',
                    success: 'Transaction confirmed!',
                    error: 'Transaction failed'
                }
            )
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

                            {voterStatus && (
                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium mb-2">Your Voting Status</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            Registered: {voterStatus.isRegistered ? 'Yes' : 'No'}
                                        </p>
                                        <p className="text-sm">
                                            Has Voted: {voterStatus.hasVoted ? 'Yes' : 'No'}
                                        </p>
                                        {voterStatus.hasVoted && (
                                            <p className="text-sm">
                                                Voted for Candidate ID: {voterStatus.voteCandidateId}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <Button
                                onClick={handleVote}
                                disabled={isVoting || (voterStatus?.hasVoted ?? false)}
                                className="w-full"
                            >
                                {isVoting ? 'Voting...' : voterStatus?.hasVoted ? 'Already Voted' : 'Vote for this Candidate'}
                            </Button>
                            {voterStatus?.hasVoted && (
                                <p className="mt-2 text-sm text-center text-muted-foreground">
                                    You have already cast your vote. Thank you for participating!
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
