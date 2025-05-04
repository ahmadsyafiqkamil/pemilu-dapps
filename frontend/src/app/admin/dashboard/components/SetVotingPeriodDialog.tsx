'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/libs/api'
import { toast } from 'sonner'
import { usePublicClient, useWalletClient } from 'wagmi'
import { useAccount } from 'wagmi'

interface SetVotingPeriodDialogProps {
  walletAddress: string
  onSuccess?: () => void
}

export function SetVotingPeriodDialog({ walletAddress, onSuccess }: SetVotingPeriodDialogProps) {
  const [open, setOpen] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [votingPeriodStatus, setVotingPeriodStatus] = useState<{
    isSet: boolean;
    isActive: boolean;
    hasEnded: boolean;
    startTime: number;
    endTime: number;
  }>({
    isSet: false,
    isActive: false,
    hasEnded: false,
    startTime: 0,
    endTime: 0
  })
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  useEffect(() => {
    const checkVotingPeriod = async () => {
      try {
        const periodStatus = await api.getVotingPeriod()
        setVotingPeriodStatus(periodStatus)
      } catch (error) {
        console.error('Error checking voting period:', error)
      }
    }
    checkVotingPeriod()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!address || !walletClient || !publicClient) {
      toast.error('Please connect your wallet first')
      setLoading(false)
      return
    }

    try {
      // Convert string dates to timestamps
      const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000)
      const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000)

      // Validate timestamps
      if (startTimestamp >= endTimestamp) {
        toast.error("Start time must be before end time")
        setLoading(false)
        return
      }

      if (startTimestamp < Math.floor(Date.now() / 1000)) {
        toast.error("Start time must be in the future")
        setLoading(false)
        return
      }

      // Validate wallet address
      if (!walletAddress || !walletAddress.startsWith('0x')) {
        toast.error("Invalid wallet address")
        setLoading(false)
        return
      }

      const response = await api.setVotingPeriod(walletAddress, startTimestamp, endTimestamp)
      console.log('Backend response:', response)
      console.log('Response type:', typeof response)
      console.log('Response keys:', Object.keys(response))
      
      const { tx_hash: tx } = response
      console.log('Transaction data:', tx)
      
      // Show loading toast while waiting for signature
      toast.loading('Waiting for signature...')
      
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
              const updatedStatus = await api.getVotingPeriod()
              setVotingPeriodStatus(updatedStatus)
              setOpen(false)
              onSuccess?.()
              return receipt
            } else {
              throw new Error('Transaction failed')
            }
          } catch (error) {
            console.error('Transaction error:', error)
            throw error
          }
        })(),
        {
          loading: 'Processing transaction...',
          success: (receipt) => `Voting period has been set successfully! Block: ${receipt.blockNumber}`,
          error: (err) => `Failed to set voting period: ${err instanceof Error ? err.message : 'Unknown error'}`
        }
      )

    } catch (error) {
      console.error('Error details:', error)
      toast.error(error instanceof Error ? error.message : "Failed to set voting period")
    } finally {
      setLoading(false)
    }
  }

  const handleStopVotingPeriod = async () => {
    if (!address || !walletClient || !publicClient) {
      toast.error('Please connect your wallet first')
      return
    }

    setLoading(true)
    try {
      const response = await api.stopVotingPeriod(walletAddress)
      const { tx_hash: tx } = response

      toast.loading('Waiting for signature...')

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

      toast.dismiss()

      await toast.promise(
        (async () => {
          try {
            const receipt = await publicClient.waitForTransactionReceipt({ hash })
            if (receipt.status === 'success') {
              const updatedStatus = await api.getVotingPeriod()
              setVotingPeriodStatus(updatedStatus)
              onSuccess?.()
              return receipt
            } else {
              throw new Error('Transaction failed')
            }
          } catch (error) {
            console.error('Transaction error:', error)
            throw error
          }
        })(),
        {
          loading: 'Processing transaction...',
          success: (receipt) => `Voting period has been stopped successfully! Block: ${receipt.blockNumber}`,
          error: (err) => `Failed to stop voting period: ${err instanceof Error ? err.message : 'Unknown error'}`
        }
      )
    } catch (error) {
      console.error('Error details:', error)
      toast.error(error instanceof Error ? error.message : "Failed to stop voting period")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  if (votingPeriodStatus.isSet) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          {votingPeriodStatus.isActive && (
            <Button 
              variant="destructive" 
              onClick={handleStopVotingPeriod}
              disabled={loading}
            >
              {loading ? "Stopping..." : "Stop Voting Period"}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Set Voting Period</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Voting Period</DialogTitle>
          <DialogDescription>
            Set the start and end time for the voting period. Make sure to set times in the future.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                className="col-span-3"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                className="col-span-3"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Setting..." : "Set Period"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 