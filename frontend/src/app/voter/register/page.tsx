'use client'

import { useState } from 'react'
import { api } from '@/libs/api'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterVoter() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { refreshAuth } = useAuth()

  const handleRegister = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to register as a voter?')
    if (!confirmed) return

    if (!address || !walletClient || !publicClient) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsLoading(true)

    try {
      // Check current voter status first
      const currentStatus = await api.checkVoterStatus(address)
      if (currentStatus.is_registered) {
        toast.error('You are already registered as a voter')
        setIsLoading(false)
        return
      }

      // Show loading toast while waiting for registration
      toast.loading('Preparing registration...')

      const response = await api.registerVoter(address)
      console.log('Backend response:', response)

      // Dismiss the loading toast
      toast.dismiss()

      // Show loading toast while waiting for signature
      toast.loading('Waiting for signature...')

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

      // Wait for transaction confirmation with toast
      await toast.promise(
        (async () => {
          try {
            const receipt = await publicClient.waitForTransactionReceipt({ hash })
            if (receipt.status === 'success') {
              console.log('Transaction confirmed:', receipt)
              
              // Wait for blockchain to process the transaction
              await new Promise(resolve => setTimeout(resolve, 15000))
              
              // Refresh auth status
              await refreshAuth()
              
              // Check if user is now registered as voter
              const newStatus = await api.checkVoterStatus(address)
              console.log('Voter status after registration:', newStatus)
              
              if (newStatus.is_registered) {
                // Only redirect if confirmed as voter
                setTimeout(() => {
                  router.push('/voter/vote')
                }, 1500)
                return receipt
              } else {
                console.error('Voter registration failed - status check returned false')
                throw new Error('Registration transaction succeeded but voter status not updated. Please try again.')
              }
            } else {
              console.error('Transaction failed:', receipt)
              throw new Error('Transaction failed')
            }
          } catch (error) {
            console.error('Error in registration process:', error)
            throw error
          }
        })(),
        {
          loading: 'Processing transaction...',
          success: 'Successfully registered as voter! Redirecting to dashboard...',
          error: 'Registration failed'
        }
      )

    } catch (error) {
      console.error('Error in registration:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">Register as Voter</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Registering...' : 'Register as Voter'}
          </button>
        </div>
      </div>
    </div>
  )
}