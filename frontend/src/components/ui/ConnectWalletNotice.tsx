'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function ConnectWalletNotice() {
  const { isConnected } = useAccount()

  if (isConnected) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Please connect your wallet to continue
      </h1>
      <ConnectButton />
    </div>
  )
}
