import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { createStorage, cookieStorage } from 'wagmi'
import { sepolia } from 'wagmi/chains'

const localNetwork = {
  id: 31337,
  name: 'Local Anvil',
  network: 'GoChain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'GoChain',
    symbol: 'GO',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
  blockExplorers: {
    default: { name: 'Local', url: '' },
  },
}

export const config = getDefaultConfig({
  appName: 'Web3 Notes',
  projectId: '963318628f4dc417f350517c4399d235', // 👉 daftar gratis di https://cloud.walletconnect.com
  chains: [localNetwork, sepolia],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
   }),
})
