'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { api } from '@/libs/api'
import type { Candidate } from '@/libs/api'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageIcon } from "@/components/ui/icons"
import { VotingCountdown } from '@/components/voting-countdown'
import Image from 'next/image'
import Link from 'next/link'

export default function VotePage() {
    const { address } = useAccount()
    const router = useRouter()
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadCandidates()
    }, [])

    const loadCandidates = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await api.getAllCandidates()
            setCandidates(data || [])
        } catch (err) {
            console.error('Error loading candidates:', err)
            setError(err instanceof Error ? err.message : 'Gagal memuat kandidat')
            setCandidates([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Berikan Suara Anda</h1>
                <p className="text-muted-foreground mt-2">
                    Pilih kandidat untuk melihat detail dan memberikan suara Anda. Anda hanya dapat memilih sekali.
                </p>
            </div>

            <VotingCountdown />

            {loading && (
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
            
            {error && (
                <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-6">
                    <p>{error}</p>
                </div>
            )}
            
            {!loading && !error && candidates.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-muted/20 rounded-lg p-8">
                    <div className="text-center max-w-md">
                        <div className="bg-background rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Tidak Ada Kandidat Tersedia</h3>
                        <p className="text-muted-foreground">
                            Saat ini tidak ada kandidat yang tersedia untuk dipilih.
                        </p>
                    </div>
                </div>
            )}
            
            {!loading && !error && candidates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((candidate) => (
                        <Link href={`/voter/vote/${candidate.id}`} key={candidate.id}>
                            <Card className="transition-all cursor-pointer hover:scale-105">
                                <Card.Header>
                                    <Card.Title>{candidate.name}</Card.Title>
                                </Card.Header>
                                <Card.Content>
                                    <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
                                        {candidate.imageCID ? (
                                            <Image
                                                src={`https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${candidate.imageCID}`}
                                                alt={candidate.name}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                loading="lazy"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                                                    <p className="mt-2 text-sm text-muted-foreground">Tidak ada gambar tersedia</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card.Content>
                                <Card.Footer className="flex justify-end">
                                    <Button variant="outline">
                                        Lihat Detail
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
