import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { createStorage, cookieStorage } from 'wagmi'
import { sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Web3 Notes',
  projectId: '963318628f4dc417f350517c4399d235', // 👉 daftar gratis di https://cloud.walletconnect.com
  chains: [sepolia],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
   }),
})
