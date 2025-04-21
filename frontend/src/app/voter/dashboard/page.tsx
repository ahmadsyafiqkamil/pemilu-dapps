'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  const { address } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!address) {
      router.push('/')
    }
  }, [address, router])

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Address: {address}</p>
    </div>
  )
}
