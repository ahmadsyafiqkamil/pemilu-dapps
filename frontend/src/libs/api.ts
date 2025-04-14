const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Candidate {
  id: number
  name: string
  voteCount: number
}

interface AdminResponse {
  is_admin: boolean
}

interface TransactionResponse {
  message: string
  tx_hash: string
}

export const api = {
  // Admin related functions
  checkAdminStatus: async (walletAddress: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admins/check/${walletAddress}`)
      if (!response.ok) {
        throw new Error('Failed to check admin status')
      }
      const data: AdminResponse = await response.json()
      return data.is_admin
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  },

  addAdmin: async (ownerAddress: string, newAdminAddress: string): Promise<TransactionResponse> => {
    try {
      const response = await fetch(`${API_URL}/admins?owner_address=${ownerAddress}&new_admin_address=${newAdminAddress}`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to add admin')
      }
      return response.json()
    } catch (error) {
      throw new Error(`Error adding admin: ${error}`)
    }
  },

  removeAdmin: async (ownerAddress: string, adminAddress: string): Promise<TransactionResponse> => {
    try {
      const response = await fetch(`${API_URL}/admins/${adminAddress}?owner_address=${ownerAddress}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to remove admin')
      }
      return response.json()
    } catch (error) {
      throw new Error(`Error removing admin: ${error}`)
    }
  },

  // Candidate related functions
  getAllCandidates: async (): Promise<Candidate[]> => {
    try {
      const response = await fetch(`${API_URL}/candidates`)
      if (!response.ok) {
        throw new Error('Failed to fetch candidates')
      }
      return response.json()
    } catch (error) {
      throw new Error(`Error fetching candidates: ${error}`)
    }
  },

  addCandidate: async (address: string, name: string): Promise<TransactionResponse> => {
    try {
      const response = await fetch(`${API_URL}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, name }),
      })
      if (!response.ok) {
        throw new Error('Failed to add candidate')
      }
      return response.json()
    } catch (error) {
      throw new Error(`Error adding candidate: ${error}`)
    }
  },
} 