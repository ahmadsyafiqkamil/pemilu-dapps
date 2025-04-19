'use client'

import { useState, useEffect } from 'react'
import { api } from '@/libs/api'
import type { Candidate } from '@/libs/api'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ImageIcon } from "@/components/ui/icons"
import Image from 'next/image'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { toast } from 'sonner'

export default function CandidatePage() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'confirmed' | 'failed' | null>(null)

  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = () => {
    setLoading(true)
    api.getAllCandidates()
      .then(setCandidates)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleAddCandidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setTransactionHash(null)
    setTransactionStatus(null)

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

      setTransactionHash(hash)
      setTransactionStatus('pending')
      
      // Wait for transaction confirmation
      toast.promise(
        (async () => {
          try {
            const receipt = await publicClient.waitForTransactionReceipt({ hash })
            if (receipt.status === 'success') {
              setTransactionStatus('confirmed')
              console.log('Transaction confirmed:', receipt)
              console.log('Block number:', receipt.blockNumber)
              loadCandidates() // Refresh the candidates list
              return receipt
            } else {
              setTransactionStatus('failed')
              throw new Error('Transaction failed')
            }
          } catch (error) {
            setTransactionStatus('failed')
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
      setTransactionStatus('failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render transaction status
  const renderTransactionStatus = () => {
    if (!transactionHash) return null;

    return (
      <div className="mt-4 p-4 rounded-lg border">
        <h3 className="font-semibold">Transaction Status</h3>
        <p className="mt-2">
          Hash: <a 
            href={`https://sepolia.etherscan.io/tx/${transactionHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600"
          >
            {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
          </a>
        </p>
        <p className="mt-1">
          Status: <span className={`font-medium ${
            transactionStatus === 'confirmed' ? 'text-green-600' :
            transactionStatus === 'failed' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {transactionStatus || 'Unknown'}
          </span>
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Candidate</Button>
          </DialogTrigger>
          <DialogContent aria-label="Add New Candidate Form">
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium mb-1">Image</label>
                <Input 
                  id="image" 
                  name="image" 
                  type="file" 
                  accept="image/*"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Add Candidate'}
              </Button>
              {renderTransactionStatus()}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <Card key={candidate.id}>
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
                    priority={false}
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
            <Card.Footer>
              <p className="text-sm text-gray-500">Votes: {candidate.voteCount}</p>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </div>
  )
}
