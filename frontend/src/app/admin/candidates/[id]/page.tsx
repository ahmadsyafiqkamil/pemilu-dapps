'use client'

import { useState, useEffect } from 'react'
import { api } from '@/libs/api'
import type { Candidate } from '@/libs/api'
import { Card } from "@/components/ui/card"
import { ImageIcon } from "@/components/ui/icons"
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2 } from "lucide-react"
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
  const [isRemoving, setIsRemoving] = useState(false)

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

  const handleRemoveCandidate = async () => {
    if (!address || !walletClient || !publicClient || !candidate) {
      toast.error('Silahkan hubungkan wallet anda terlebih dahulu')
      return
    }

    try {
      setIsRemoving(true)
      const response = await api.removeCandidate(candidate.id, address)
      console.log('Backend response:', response)

      // Show loading toast while waiting for signature
      toast.loading('Menunggu tanda tangan...')
      
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

      // Dismiss the signature waiting toast
      toast.dismiss()

      // Wait for transaction confirmation
      await toast.promise(
        (async () => {
          try {
            const receipt = await publicClient.waitForTransactionReceipt({ hash })
            if (receipt.status === 'success') {
              console.log('Transaction confirmed:', receipt)
              router.push('/admin/candidates')
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
    } finally {
      setIsRemoving(false)
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
          <p className="text-lg">Kandidat tidak ditemukan</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemoveCandidate}
            disabled={isRemoving}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isRemoving ? 'Menghapus...' : 'Hapus Kandidat'}
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
                  <p className="mt-2 text-muted-foreground">Tidak ada gambar</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{candidate.name}</h1>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground">Jumlah Suara</h3>
                <p className="text-2xl font-bold mt-1">{candidate.voteCount}</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground">ID Kandidat</h3>
                <p className="text-sm font-mono mt-1">{candidate.id}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 