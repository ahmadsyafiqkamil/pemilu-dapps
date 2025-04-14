'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ConnectButton } from '@/components/ui/connectButton';

export const VoterNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/voter/home" className="text-xl font-bold">
                E-Voting
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/voter/home"
                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500"
              >
                Home
              </Link>
              <Link
                href="/voter/vote"
                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500"
              >
                Vote
              </Link>
              <Link
                href="/voter/results"
                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500"
              >
                Results
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {user?.address.slice(0, 6)}...{user?.address.slice(-4)}
            </span>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}; 