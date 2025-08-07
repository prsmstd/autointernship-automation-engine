'use client'

import { useState } from 'react'
import Link from 'next/link'

const DOMAIN_MAPPINGS = {
  'web_development': 'Web Development',
  'ui_ux_design': 'UI/UX Design',
  'data_science': 'Data Science',
  'pcb_design': 'PCB Design',
  'embedded_programming': 'Embedded Programming',
  'fpga_verilog': 'FPGA & Verilog'
}

const MOCK_STATS = {
  totalUsers: 156,
  totalSubmissions: 423,
  totalPayments: 89,
  totalCertificates: 89,
  revenueGenerated: 8811, // ₹89 * 99
  domainBreakdown: {
    'web_development': 45,
    'ui_ux_design': 38,
    'data_science': 32,
    'pcb_design': 18,
    'embedded_programming': 15,
    'fpga_verilog': 8
  }
}

const MOCK_USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', domain: 'web_development', role: 'student', created_at: '2025-01-15T10:30:00Z' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', domain: 'ui_ux_design', role: 'student', created_at: '2025-01-14T15:45:00Z' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', domain: 'data_science', role: 'student', created_at: '2025-01-13T09:20:00Z' },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', domain: 'pcb_design', role: 'student', created_at: '2025-01-12T14:10:00Z' },
  { id: '5', name: 'Alex Brown', email: 'alex@example.com', domain: 'embedded_programming', role: 'student', created_at: '2025-01-11T11:55:00Z' }
]

const MOCK_SUBMISSIONS = [
  { id: '1', users: { name: 'John Doe', email: 'john@example.com' }, tasks: { title: 'Responsive Landing Page', domain: 'web_development' }, score: 85, status: 'evaluated', submitted_at: '2025-01-15T12:00:00Z' },
  { id: '2', users: { name: 'Jane Smith', email: 'jane@example.com' }, tasks: { title: 'Mobile App Wireframes', domain: 'ui_ux_design' }, score: 92, status: 'evaluated', submitted_at: '2025-01-15T10:30:00Z' },
  { id: '3', users: { name: 'Mike Johnson', email: 'mike@example.com' }, tasks: { title: 'Data Analysis Project', domain: 'data_science' }, score: 78, status: 'evaluated', submitted_at: '2025-01-14T16:45:00Z' },
  { id: '4', users: { name: 'Sarah Wilson', email: 'sarah@example.com' }, tasks: { title: 'Circuit Design', domain: 'pcb_design' }, score: null, status: 'pending', submitted_at: '2025-01-14T14:20:00Z' }
]

const MOCK_PAYMENTS = [
  { id: '1', users: { name: 'John Doe', email: 'john@example.com' }, amount: 9900, status: 'paid', razorpay_payment_id: 'pay_mock123', created_at: '2025-01-15T13:00:00Z' },
  { id: '2', users: { name: 'Jane Smith', email: 'jane@example.com' }, amount: 9900, status: 'paid', razorpay_payment_id: 'pay_mock456', created_at: '2025-01-14T17:30:00Z' },
  { id: '3', users: { name: 'Mike Johnson', email: 'mike@example.com' }, amount: 9900, status: 'pending', razorpay_payment_id: null, created_at: '2025-01-14T18:00:00Z' }
]

const MOCK_CERTIFICATES = [
  { id: '1', certificate_id: 'PRISM-2025-ABC123', users: { name: 'John Doe', email: 'john@example.com', domain: 'web_development' }, issued_at: '2025-01-15T13:30:00Z' },
  { id: '2', certificate_id: 'PRISM-2025-DEF456', users: { name: 'Jane Smith', email: 'jane@example.com', domain: 'ui_ux_design' }, issued_at: '2025-01-14T18:00:00Z' }
]

export function MockAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-900">PrismStudio Admin</h1>
              <span className="ml-4 text-sm text-gray-500">Mock Environment</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-sm text-primary-600 hover:text-primary-700">
                ← Back to Home
              </Link>
              <span className="text-sm text-gray-700">Admin Panel (Mock)</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-users text-blue-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{MOCK_STATS.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-file-alt text-green-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Submissions</p>
                <p className="text-2xl font-semibold text-gray-900">{MOCK_STATS.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-credit-card text-purple-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{MOCK_STATS.totalPayments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-certificate text-yellow-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Certificates</p>
                <p className="text-2xl font-semibold text-gray-900">{MOCK_STATS.totalCertificates}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue and Domain Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Revenue Generated (Mock)</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(MOCK_STATS.revenueGenerated)}
            </div>
            <p className="text-sm text-gray-500">
              From {MOCK_STATS.totalPayments} successful payments
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Domain Distribution</h3>
            <div className="space-y-2">
              {Object.entries(MOCK_STATS.domainBreakdown).map(([domain, count]) => (
                <div key={domain} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {DOMAIN_MAPPINGS[domain as keyof typeof DOMAIN_MAPPINGS] || domain}
                  </span>
                  <span className="text-sm font-semibold">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: 'fas fa-chart-bar' },
              { id: 'users', name: 'Users', icon: 'fas fa-users' },
              { id: 'submissions', name: 'Submissions', icon: 'fas fa-file-alt' },
              { id: 'payments', name: 'Payments', icon: 'fas fa-credit-card' },
              { id: 'certificates', name: 'Certificates', icon: 'fas fa-certificate' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">All Users (Mock Data)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {MOCK_USERS.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {DOMAIN_MAPPINGS[user.domain as keyof typeof DOMAIN_MAPPINGS] || user.domain || 'Not Selected'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Submissions (Mock Data)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {MOCK_SUBMISSIONS.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{submission.users?.name}</div>
                          <div className="text-sm text-gray-500">{submission.users?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{submission.tasks?.title}</div>
                          <div className="text-sm text-gray-500">
                            {DOMAIN_MAPPINGS[submission.tasks?.domain as keyof typeof DOMAIN_MAPPINGS]}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.score ? `${Math.round(submission.score)}/100` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          submission.status === 'evaluated' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(submission.submitted_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Payment History (Mock Data)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {MOCK_PAYMENTS.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.users?.name}</div>
                          <div className="text-sm text-gray-500">{payment.users?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount / 100)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {payment.razorpay_payment_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Issued Certificates (Mock Data)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issued Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {MOCK_CERTIFICATES.map((certificate) => (
                    <tr key={certificate.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{certificate.users?.name}</div>
                          <div className="text-sm text-gray-500">{certificate.users?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-gray-900">
                          {certificate.certificate_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {DOMAIN_MAPPINGS[certificate.users?.domain as keyof typeof DOMAIN_MAPPINGS] || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(certificate.issued_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/verify?id=${certificate.certificate_id}`}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Verify
                        </Link>
                        <button className="text-green-600 hover:text-green-900">
                          Download (Mock)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">System Overview</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <i className="fas fa-info-circle text-yellow-600 mr-3"></i>
                <div>
                  <h4 className="font-medium text-yellow-800">Mock Environment</h4>
                  <p className="text-sm text-yellow-700">
                    This is a demonstration environment with mock data. No real API keys or database connections are required.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">System Features</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Multi-domain internship support
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    AI-powered evaluation system
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Automated certificate generation
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Payment processing integration
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Certificate verification system
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Link href="/dashboard" className="block text-sm text-primary-600 hover:text-primary-700">
                    → View Student Dashboard
                  </Link>
                  <Link href="/verify?id=PRISM-2025-DEMO123" className="block text-sm text-primary-600 hover:text-primary-700">
                    → Test Certificate Verification
                  </Link>
                  <button className="block text-sm text-gray-500">
                    → Export Data (Mock)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}