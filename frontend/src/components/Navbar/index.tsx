'use client';

import { useAuth } from '@/hooks/useAuth';
import { AdminNavbar } from './AdminNavbar';
import { VoterNavbar } from './VoterNavbar';
import { ConnectButton } from '@/components/ui/connectButton';

export const Navbar = () => {
  const { isAdmin, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
        </div>
      </nav>
    );
  }

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <span className="text-xl font-bold">E-Voting</span>
          <ConnectButton />
        </div>
      </nav>
    );
  }

  if (isAdmin) {
    return <AdminNavbar />;
  }

  return <VoterNavbar />;
}; 