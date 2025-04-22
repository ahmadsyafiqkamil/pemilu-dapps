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
              
              // Refresh auth status after successful registration
              await refreshAuth()
              
              // Redirect to voter dashboard after successful registration
              setTimeout(() => {
                router.push('/voter/dashboard')
              }, 1500) // Wait 1.5 seconds before redirecting to show the success message
              
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