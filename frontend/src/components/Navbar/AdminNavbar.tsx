'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ConnectButton } from '@/components/ui/connectButton';

export const AdminNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin/dashboard" className="text-xl font-bold text-indigo-600">
                Admin Panel
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/admin/dashboard"
                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/voters"
                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500"
              >
                Manage Voters
              </Link>
              <Link
                href="/admin/candidates"
                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500"
              >
                Manage Candidates
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                Admin
              </span>
              {/* <span className="text-sm text-gray-500">
                {user?.address.slice(0, 6)}...{user?.address.slice(-4)}
              </span> */}
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};