'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { api } from '@/libs/api';

interface User {
  address: string;
  role: 'admin' | 'voter' | 'unregistered';
  hasVoted?: boolean;
  voteCandidateId?: number;
}

export const useAuth = () => {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    if (isConnected && address) {
      try {
        // Cek status admin menggunakan API
        const isAdmin = await api.checkAdminStatus(address);
        
        if (isAdmin) {
          setUser({
            address,
            role: 'admin',
          });
        } else {
          // Jika bukan admin, cek status voter
          const voterStatus = await api.checkVoterStatus(address);
          setUser({
            address,
            role: voterStatus.is_registered ? 'voter' : 'unregistered',
            hasVoted: voterStatus.has_voted,
            voteCandidateId: voterStatus.vote_candidate_id
          });
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setUser({
          address,
          role: 'unregistered', // Default ke unregistered jika terjadi error
        });
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [address, isConnected]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isVoter: user?.role === 'voter',
    isUnregistered: user?.role === 'unregistered',
    hasVoted: user?.hasVoted,
    voteCandidateId: user?.voteCandidateId,
    isAuthenticated: isConnected && user !== null,
    refreshAuth: checkAuth, // Expose the refresh function
  };
}; 