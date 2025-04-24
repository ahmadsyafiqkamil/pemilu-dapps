'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ConnectButton } from '@/components/ui/connectButton';

export const VoterNavbar = () => {
  const { user, isVoter } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/voter/vote" className="text-xl font-bold">
                E-Voting
              </Link>
            </div>
            {isVoter && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  isVoter 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isVoter ? 'Voter' : 'Unregistered'}
                </span>
              </div>
            )}
            <ConnectButton />   
          </div>
        </div>
      </div>
    </nav>
  );
}; 