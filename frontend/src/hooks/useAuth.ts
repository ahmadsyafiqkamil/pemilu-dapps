'use client'

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { api } from '@/libs/api';

interface User {
  address: string;
  role: 'admin' | 'voter';
}

export const useAuth = () => {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (isConnected && address) {
        try {
          // Cek status admin menggunakan API
          const isAdmin = await api.checkAdminStatus(address);
          
          // Set user data berdasarkan hasil pengecekan API
          setUser({
            address,
            role: isAdmin ? 'admin' : 'voter',
          });
        } catch (error) {
          console.error('Error checking admin status:', error);
          setUser({
            address,
            role: 'voter', // Default ke voter jika terjadi error
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, [address, isConnected]);

  return {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isVoter: user?.role === 'voter',
    isAuthenticated: isConnected && user !== null,
  };
}; 