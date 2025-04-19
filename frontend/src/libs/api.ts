const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT

if (!PINATA_JWT) {
  throw new Error('Missing Pinata JWT - please check your environment variables')
}

export interface Candidate {
  id: number
  name: string
  voteCount: number
  imageCID: string
}

interface AdminResponse {
  is_admin: boolean
}

interface TransactionResponse {
  message: string
  tx_hash: string
}

interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

interface RawTransaction {
  value: number;
  from: string;
  nonce: number;
  gas: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  type: number;
  chainId: number;
  to: string;
  data: string;
}

interface AddCandidateResponse {
  message: string;
  tx_hash: RawTransaction;
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
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Failed to fetch candidates: ${response.status} ${response.statusText}`);
      }
      return response.json()
    } catch (error) {
      console.error('Error in getAllCandidates:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch candidates');
    }
  },

  getCandidateDetails: async (candidateId: number): Promise<Candidate> => {
    try {
      const response = await fetch(`${API_URL}/candidates/${candidateId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch candidate details')
      }
      return response.json()
    } catch (error) {
      console.error('Error in getCandidateDetails:', error)
      throw error instanceof Error ? error : new Error('Failed to fetch candidate details')
    }
  },
  

  uploadImageToIPFS: async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const metadata = JSON.stringify({
        name: file.name
      })
      formData.append('pinataMetadata', metadata)

      const pinataOptions = JSON.stringify({
        cidVersion: 1
      })
      formData.append('pinataOptions', pinataOptions)

      const response = await fetch(PINATA_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Failed to upload to Pinata: ${response.statusText}`)
      }

      const result: PinataResponse = await response.json()
      return result.IpfsHash
    } catch (error) {
      throw new Error(`Error uploading to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  addCandidate: async (name: string, imageCID: string, address: string): Promise<AddCandidateResponse> => {
    try {
      const response = await fetch(`${API_URL}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name,
          imageCID,
          address
        }),
      })
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add candidate');
      }
      return response.json()
    } catch (error) {
      throw error instanceof Error ? error : new Error('Error adding candidate');
    }
  },
} 