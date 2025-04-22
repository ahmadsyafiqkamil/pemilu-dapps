'use client'

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { api } from '@/libs/api';

interface User {
  address: string;
  role: 'admin' | 'voter' | 'unregistered';
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
          
          if (isAdmin) {
            setUser({
              address,
              role: 'admin',
            });
          } else {
            // Jika bukan admin, cek apakah terdaftar sebagai voter
            const isRegistered = await api.checkVoterStatus(address);
            setUser({
              address,
              role: isRegistered ? 'voter' : 'unregistered',
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
    };

    checkAuth();
  }, [address, isConnected]);

  return {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isVoter: user?.role === 'voter',
    isUnregistered: user?.role === 'unregistered',
    isAuthenticated: isConnected && user !== null,
  };
}; 