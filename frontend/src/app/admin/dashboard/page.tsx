'use client'

import { useEffect, useState } from 'react';
import { api } from '@/libs/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

interface DashboardStats {
  totalVoters: number;
  totalCandidates: number;
  totalVotes: number;
}

interface Candidate {
  id: number;
  name: string;
  voteCount: number;
}

interface Voter {
  id: number;
  address: string;
  isRegistered: boolean;
  hasVoted: boolean;
}

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalVoters: 0,
    totalCandidates: 0,
    totalVotes: 0,
  });
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  // const [voters, setVoters] = useState<Voter[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch candidates
        const candidatesData = await api.getAllCandidates();
        setCandidates(candidatesData);

        // Fetch voters
        const votersData = await api.getAllVoters();
        // setVoters(votersData);

        // Set stats
        setStats({
          totalVoters: 0,
          totalCandidates: candidatesData.length,
          totalVotes: candidatesData.reduce((acc, curr) => acc + curr.voteCount, 0),
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the election management system.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Voters</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalVoters}</p>
        </Card>
        <Card className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Candidates</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalCandidates}</p>
        </Card>
        <Card className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Votes Cast</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalVotes}</p>
        </Card>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Current Candidates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((candidate) => {
                const percentage = stats.totalVotes > 0
                  ? ((candidate.voteCount / stats.totalVotes) * 100).toFixed(2)
                  : '0.00';

                return (
                  <tr key={candidate.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{candidate.voteCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{percentage}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/admin/voters')}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Manage Voters
            </button>
            <button
              onClick={() => router.push('/admin/candidates')}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Manage Candidates
            </button>
          </div>
        </Card>
        
        <Card className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Election Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Active
              </span>
            </div>
            <button
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              End Election
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}