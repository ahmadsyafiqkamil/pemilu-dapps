'use client'

import { useAccount } from 'wagmi'
// import { useRouter } from 'next/navigation'
import ConnectWalletNotice from '@/components/ui/ConnectWalletNotice'

export default function Home() {
  const { isConnected } = useAccount()
  // const router = useRouter()

  // ⏩ Redirect jika wallet terkoneksi
  // useEffect(() => {
  //   if (isConnected) {
  //     router.push('/notes')
  //   }
  // }, [isConnected, router])

  // Jika belum connect, tampilkan notice
  if (!isConnected) {
    return <ConnectWalletNotice />
  }

  // Render kosong/placeholder jika sedang proses redirect
  return (
    <div className="min-h-screen flex items-center justify-center text-muted">
      Redirecting...
    </div>
  )
}
