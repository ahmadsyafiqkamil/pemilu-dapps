'use client'

import { useAccount } from 'wagmi'
import ConnectWalletNotice from '@/components/ui/ConnectWalletNotice'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/libs/api'

export default function Home() {
  const { isConnected, address } = useAccount()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  // ⏩ Redirect berdasarkan role dari backend
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (isConnected && address) {
        setIsChecking(true)
        try {
          const isAdmin = await api.checkAdminStatus(address)
          if (isAdmin) {
            router.push('/admin/dashboard')
          } else {
            router.push('/voter/dashboard')
          }
        } catch (error) {
          console.error('Error during role check:', error)
          // Jika terjadi error, arahkan ke halaman voter sebagai fallback
          router.push('/voter/dashboard')
        } finally {
          setIsChecking(false)
        }
      }
    }

    checkAndRedirect()
  }, [isConnected, address, router])

  // Jika belum connect, tampilkan notice
  if (!isConnected) {
    return <ConnectWalletNotice />
  }

  // Render loading state saat mengecek role atau redirect
  return (
    <div className="min-h-screen flex flex-col gap-2 items-center justify-center text-muted">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <div>{isChecking ? "Memeriksa status admin..." : "Mengalihkan..."}</div>
    </div>
  )
}
