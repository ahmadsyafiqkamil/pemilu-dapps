'use client'

import { useEffect, useRef } from 'react'
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from '@rainbow-me/rainbowkit'
import { useAccount, useDisconnect } from 'wagmi'
import { emojiAvatarForAddress } from '@/libs/emojiAvatarForAddress'
import { useRouter } from 'next/navigation'

export const ConnectButton = () => {
  const { isConnecting, address, isConnected, chain } = useAccount()
  const { color: backgroundColor, emoji } = emojiAvatarForAddress(address ?? '')
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { openChainModal } = useChainModal()
  const { disconnect } = useDisconnect()
  const router = useRouter()

  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
  }, [])

  // ✅ Redirect to "/" on disconnect
  useEffect(() => {
    if (!isConnected && isMounted.current) {
      router.push('/')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return (
      <button
        className="btn"
        onClick={() => {
          openConnectModal?.()
        }}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    )
  }

  if (!chain) {
    return (
      <button className="btn" onClick={openChainModal}>
        Wrong network
      </button>
    )
  }

  return (
    <div className="flex items-center">
      <button
        className="flex items-center gap-2 px-4 py-2 border border-neutral-700 bg-neutral-800/30 rounded-xl font-mono text-sm hover:bg-neutral-800/50 transition-colors"
        onClick={() => openAccountModal?.()}
      >
        <div
          className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor,
            boxShadow: '0px 2px 2px 0px rgba(81, 98, 255, 0.20)',
          }}
        >
          {emoji}
        </div>
        <span>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </button>
    </div>
  )
}
