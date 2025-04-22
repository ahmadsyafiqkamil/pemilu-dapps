'use client'

import { useAccount } from 'wagmi'
import ConnectWalletNotice from '@/components/ui/ConnectWalletNotice'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const { isAdmin, isVoter, isUnregistered, loading } = useAuth()

  // ⏩ Redirect berdasarkan role dari backend
  useEffect(() => {
    if (!loading && isConnected) {
      if (isAdmin) {
        router.push('/admin/dashboard')
      } else if (isVoter) {
        router.push('/voter/dashboard')
      } else if (isUnregistered) {
        router.push('/admin/voters/register')
      }
    }
  }, [isAdmin, isVoter, isUnregistered, loading, isConnected, router])

  // Jika belum connect, tampilkan notice
  if (!isConnected) {
    return <ConnectWalletNotice />
  }

  // Render loading state saat mengecek role atau redirect
  return (
    <div className="min-h-screen flex flex-col gap-2 items-center justify-center text-muted">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <div>
        {loading 
          ? "Memeriksa status pengguna..." 
          : "Mengalihkan..."}
      </div>
    </div>
  )
}
