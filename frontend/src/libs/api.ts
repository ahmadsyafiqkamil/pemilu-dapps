import {
  Candidate,
  AdminResponse,
  TransactionResponse,
  PinataResponse,
  RawTransaction,
  AddCandidateResponse,
  VoterResponse,
  Voter,
  VotingPeriodResponse,
  WinnerResponse
} from '@/types/api';

export type { Candidate };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT

if (!PINATA_JWT) {
  throw new Error('Missing Pinata JWT - please check your environment variables')
}

export const api = {
  // =============================================
  // IPFS Utility Functions
  // =============================================
  
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

  // =============================================
  // Admin Functions
  // =============================================

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

  // =============================================
  // Candidate Functions
  // =============================================

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

  removeCandidate: async (candidateId: number, address: string): Promise<TransactionResponse> => {
    try {
      const response = await fetch(`${API_URL}/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address,
          candidateId
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to remove candidate. Make sure you are an admin.')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error in removeCandidate:', error)
      throw error instanceof Error ? error : new Error('Failed to remove candidate')
    }
  },

  getCandidateCount: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_URL}/candidates_count`)
      if (!response.ok) {
        throw new Error('Failed to fetch candidate count')
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error in getCandidateCount:', error)
      throw error instanceof Error ? error : new Error('Failed to fetch candidate count')
    }
  },

  // =============================================
  // Voter Functions
  // =============================================

  checkVoterStatus: async (walletAddress: string): Promise<VoterResponse> => {
    try {
      const response = await fetch(`${API_URL}/voters/check/${walletAddress}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Failed to check voter status: ${response.status} ${response.statusText}`);
      }
      const data: VoterResponse = await response.json()
      console.log('Voter status response:', data)
      return data
    } catch (error) {
      console.error('Error checking voter status:', error)
      return {
        is_registered: false,
        has_voted: false,
        vote_candidate_id: 0
      }
    }
  },
  
  registerVoter: async (walletAddress: string): Promise<TransactionResponse> => {
    try {
      const response = await fetch(`${API_URL}/voters/register?address=${walletAddress}`, {
        method: 'POST',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Failed to register voter: ${response.status} ${response.statusText}`);
      }
      const data = await response.json()
      console.log('Register voter response:', data)
      return data
    } catch (error) {
      console.error('Error registering voter:', error)
      throw error instanceof Error ? error : new Error('Error registering voter')
    }
  },

  getAllVoters: async (): Promise<Voter[]> => {
    try {
      const response = await fetch(`${API_URL}/all_voters`)
      if (!response.ok) {
        throw new Error('Failed to fetch voters')
      }
      const data = await response.json()
      return data.map((voter: any, index: number) => ({
        id: index + 1,
        address: voter.address,
        isRegistered: voter.isRegistered,
        hasVoted: voter.hasVoted,
        voteCandidateId: voter.voteCandidateId
      }))
    } catch (error) {
      console.error('Error fetching voters:', error)
      throw error instanceof Error ? error : new Error('Failed to fetch voters')
    }
  },

  vote: async (walletAddress: string, candidateId: number): Promise<TransactionResponse> => {
    try {
      const response = await fetch(`${API_URL}/voters/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: walletAddress,
          candidateId: candidateId
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to vote')
      }
      
      return response.json()
    } catch (error) {
      console.error('Error voting:', error)
      throw error instanceof Error ? error : new Error('Error voting')
    }
  },

  getVoterCount: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_URL}/voters_count`)
      console.log('Voter count response:', response)
      if (!response.ok) {
        throw new Error('Failed to fetch votes count')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching voter count:', error)
      throw error instanceof Error ? error : new Error('Failed to fetch voter count')
    }
  },

  // =============================================
  // Voting Period Functions
  // =============================================
  
  setVotingPeriod: async (walletAddress: string, startTime: number, endTime: number): Promise<TransactionResponse> => {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Validate times
      if (startTime < currentTime) {
        throw new Error('Start time must be in the future');
      }
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }

      console.log('Setting voting period with:', {
        walletAddress,
        startTime,
        endTime,
        startTimeDate: new Date(startTime * 1000).toLocaleString(),
        endTimeDate: new Date(endTime * 1000).toLocaleString(),
        currentTime,
        currentTimeDate: new Date().toLocaleString()
      });

      const response = await fetch(`${API_URL}/voters/set-voting-period`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: walletAddress,
          startTime: startTime,
          endTime: endTime
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to set voting period')
      }

      const data = await response.json()
      console.log('Set voting period response:', data)
      return data
    } catch (error) {
      console.error('Error setting voting period:', error)
      throw error instanceof Error ? error : new Error('Error setting voting period')
    }
  },

  getVotingPeriod: async (): Promise<VotingPeriodResponse> => {
    try {
      const response = await fetch(`${API_URL}/voting-period`)
      if (!response.ok) {
        throw new Error('Failed to fetch voting period')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching voting period:', error)
      throw error instanceof Error ? error : new Error('Failed to fetch voting period')
    }
  },

  stopVotingPeriod: async (walletAddress: string): Promise<TransactionResponse> => {
    try {
      const response = await fetch(`${API_URL}/admins/stop-voting-period`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: walletAddress
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to stop voting period')
      }
      
      return response.json()
    } catch (error) {
      console.error('Error stopping voting period:', error)
      throw error instanceof Error ? error : new Error('Error stopping voting period')
    }
  },

  getWinner: async (walletAddress: string): Promise<WinnerResponse> => {
    try {
      // First check voting period status
      const votingPeriod = await api.getVotingPeriod();
      
      // If voting period hasn't ended on blockchain, try to stop it first
      if (votingPeriod.blockchainTime <= votingPeriod.endTime) {
        try {
          await api.stopVotingPeriod(walletAddress);
          // Wait a bit for the transaction to be mined
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
          console.error('Error stopping voting period:', error);
          throw new Error('Failed to stop voting period. Please try again in a few minutes.');
        }
      }

      const response = await fetch(`${API_URL}/admins/winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: walletAddress
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get winner')
      }
      
      return response.json()
    } catch (error) {
      console.error('Error getting winner:', error)
      throw error instanceof Error ? error : new Error('Error getting winner')
    }
  }
} 