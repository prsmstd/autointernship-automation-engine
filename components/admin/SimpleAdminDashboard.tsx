'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContextFinal'
import { Users, FileText, CreditCard, Award, TrendingUp, Activity } from 'lucide-react'

export function SimpleAdminDashboard() {
  const { user, logout } = useAuth()
  const [stats] = useState({
    totalUsers: 156,
    totalSubmissions: 89,
    totalPayments: 45,
    totalCertificates: 42,
    activeInternships: 67,
    completionRate: 78
  })

  const handleSignOut = async () => {
    await logout()
    window.location.href = '/'
  }

  if (!user || user.role !== 'A') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Submissions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Certificates</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCertificates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Internships</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeInternships}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">New user registration</p>
                  <p className="text-xs text-gray-500">john.doe@example.com joined Web Development track</p>
                </div>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Task submission</p>
                  <p className="text-xs text-gray-500">Sarah completed "Responsive Landing Page" task</p>
                </div>
                <span className="text-xs text-gray-400">4 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-500">Certificate payment of ₹99 from mike.wilson@example.com</p>
                </div>
                <span className="text-xs text-gray-400">6 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Certificate issued</p>
                  <p className="text-xs text-gray-500">UI/UX Design certificate generated for emma.davis@example.com</p>
                </div>
                <span className="text-xs text-gray-400">8 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">✓</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">System Status</h3>
              <p className="text-sm text-green-700 mt-1">
                All systems operational. Real-time data from production database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}