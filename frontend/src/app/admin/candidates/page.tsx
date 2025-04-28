'use client'

import { useState, useEffect } from 'react'
import { api } from '@/libs/api'
import type { Candidate } from '@/libs/api'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageIcon } from "@/components/ui/icons"
import Image from 'next/image'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { toast } from 'sonner'
import Link from 'next/link'
import { CandidateFormDialog } from './components/CandidateFormDialog'

export default function CandidatePage() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = async () => {
    setLoading(true)
    setError(null) // Reset error state
    try {
      const data = await api.getAllCandidates()
      console.log('Loaded candidates:', data)
      setCandidates(data || []) // Ensure we always set an array
    } catch (err) {
      console.error('Error loading candidates:', err)
      setError(err instanceof Error ? err.message : 'Failed to load candidates')
      setCandidates([]) // Reset candidates on error
    } finally {
      setLoading(false)
    }
  }

  const handleAddCandidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!address || !walletClient || !publicClient) {
      setError('Please connect your wallet first')
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const imageFile = formData.get('image') as File

      if (!name.trim()) {
        throw new Error('Please enter a candidate name')
      }

      let imageCID = ''
      if (imageFile && imageFile.size > 0) {
        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
          throw new Error('Please upload an image file')
        }

        // Validate file size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB')
        }

        // Upload to IPFS through our API
        imageCID = await api.uploadImageToIPFS(imageFile)
      }

      // Get the transaction data from backend
      const response = await api.addCandidate(name, imageCID, address)
      console.log('Backend response:', response)

      // Sign and send the transaction
      const { tx_hash: tx } = response
      const hash = await walletClient.sendTransaction({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: BigInt(tx.value),
        type: (tx.type as unknown) as 'eip1559',
        maxFeePerGas: BigInt(tx.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(tx.maxPriorityFeePerGas),
        gas: BigInt(tx.gas),
        chainId: tx.chainId,
      })

      // Wait for transaction confirmation
      toast.promise(
        (async () => {
          try {
            const receipt = await publicClient.waitForTransactionReceipt({ hash })
            if (receipt.status === 'success') {
              // console.log('Transaction confirmed:', receipt)
              // console.log('Block number:', receipt.blockNumber)
              toast.success('Kandidat berhasil ditambahkan!')
              
              loadCandidates() // Refresh the candidates list
              return receipt
            } else {
              throw new Error('Transaction failed')
            }
          } catch (error) {
            throw error
          }
        })(),
        {
          loading: 'Processing transaction...',
          success: (receipt) => `Transaction confirmed! Block: ${receipt.blockNumber}`,
          error: 'Transaction failed'
        }
      )
      
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Error details:', err)
      if (err instanceof Error) {
        setError(err.message)
        toast.error(err.message)
      } else {
        setError('An unexpected error occurred')
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveCandidate = async (candidateId: number) => {
    if (!address || !walletClient || !publicClient) {
      toast.error('Silahkan hubungkan wallet anda terlebih dahulu')
      return
    }

    try {
      const response = await api.removeCandidate(candidateId, address)
      console.log('Backend response:', response)

      const { tx_hash: tx } = response
      
      // Show loading toast while waiting for signature
      toast.loading('Menunggu tanda tangan...')
      
      const hash = await walletClient.sendTransaction({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: BigInt(tx.value),
        type: (tx.type as unknown) as 'eip1559',
        maxFeePerGas: BigInt(tx.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(tx.maxPriorityFeePerGas),
        gas: BigInt(tx.gas),
        chainId: tx.chainId,
      })

      // Dismiss the signature waiting toast
      toast.dismiss()

      // Wait for transaction confirmation
      await toast.promise(
        (async () => {
          try {
            const receipt = await publicClient.waitForTransactionReceipt({ hash })
            console.log('Transaction receipt:', receipt)
            
            if (receipt.status === 'success') {
              // Only remove the candidate from state after successful transaction
              setCandidates(prev => prev.filter(c => c.id !== candidateId))
              // Double check the state by reloading
              await loadCandidates()
              return receipt
            } else {
              throw new Error('Transaksi gagal')
            }
          } catch (error) {
            console.error('Transaction error:', error)
            throw error
          }
        })(),
        {
          loading: 'Memproses transaksi...',
          success: (receipt) => `Kandidat berhasil dihapus! Block: ${receipt.blockNumber}`,
          error: (err) => `Gagal menghapus kandidat: ${err instanceof Error ? err.message : 'Unknown error'}`
        }
      )

    } catch (err) {
      console.error('Error details:', err)
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus kandidat')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <CandidateFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleAddCandidate}
          isSubmitting={isSubmitting}
          triggerButton={<Button>Add Candidate</Button>}
        />
      </div>

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
            <h3 className="text-xl font-semibold mb-2">Belum Ada Kandidat</h3>
            <p className="text-muted-foreground mb-6">
              Mulai dengan menambahkan kandidat pertama untuk pemilihan.
            </p>
            <CandidateFormDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onSubmit={handleAddCandidate}
              isSubmitting={isSubmitting}
              triggerButton={
                <Button size="lg">
                  Tambah Kandidat Pertama
                </Button>
              }
            />
          </div>
        </div>
      )}
      
      {!loading && !error && candidates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <Link href={`/admin/candidates/${candidate.id}`} key={candidate.id}>
              <Card className="transition-transform hover:scale-105">
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
                          <p className="mt-2 text-sm text-muted-foreground">No image available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Content>
                <Card.Footer className="flex justify-between items-center">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveCandidate(candidate.id);
                    }}
                  >
                    Remove
                  </Button>
                  <p className="text-sm text-muted-foreground">Votes: {candidate.voteCount}</p>
                </Card.Footer>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
