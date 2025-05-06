export interface Candidate {
  id: number;
  name: string;
  voteCount: number;
  imageCID: string;
}

export interface AdminResponse {
  is_admin: boolean;
}

export interface TransactionResponse {
  message: string;
  tx_hash: RawTransaction;
}

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface RawTransaction {
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

export interface AddCandidateResponse {
  message: string;
  tx_hash: RawTransaction;
}

export interface VoterResponse {
  is_registered: boolean;
  has_voted: boolean;
  vote_candidate_id: number;
}

export interface Voter {
  id: number;
  address: string;
  isRegistered: boolean;
  hasVoted: boolean;
  voteCandidateId?: number;
}

export interface VotingPeriodResponse {
  startTime: number;
  endTime: number;
  currentTime: number;
  isSet: boolean;
  isActive: boolean;
  hasEnded: boolean;
} 