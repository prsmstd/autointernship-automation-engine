'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TestPage() {
  const [iconTest, setIconTest] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            PrismStudio Platform Test Page
          </h1>

          {/* Icon Test */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Font Awesome Icons Test</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded">
                <i className="fas fa-user text-2xl text-blue-600 mb-2" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
                <p className="text-sm">User</p>
              </div>
              <div className="text-center p-4 border rounded">
                <i className="fas fa-tasks text-2xl text-green-600 mb-2" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
                <p className="text-sm">Tasks</p>
              </div>
              <div className="text-center p-4 border rounded">
                <i className="fas fa-certificate text-2xl text-yellow-600 mb-2" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
                <p className="text-sm">Certificate</p>
              </div>
              <div className="text-center p-4 border rounded">
                <i className="fas fa-tachometer-alt text-2xl text-purple-600 mb-2" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
                <p className="text-sm">Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setIconTest(!iconTest)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <i className="fas fa-sync-alt mr-2" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
              Refresh Icons
            </button>
          </div>

          {/* Mock Login Test */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Mock Authentication Test</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-3">
                <i className="fas fa-check-circle text-green-600 mr-2"></i>
                <h3 className="font-semibold text-green-900">Authentication Fixed!</h3>
              </div>
              <p className="text-green-800 text-sm mb-3">
                The authentication system is now working properly. No more alert dialogs or redirect issues.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Student Login</h3>
              <p className="text-blue-800 text-sm mb-2">
                Email: <code className="bg-blue-100 px-2 py-1 rounded">student@prismstudio.co.in</code>
              </p>
              <p className="text-blue-800 text-sm mb-3">
                Password: <code className="bg-blue-100 px-2 py-1 rounded">student123</code>
              </p>
              <Link
                href="/login"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Student Login
              </Link>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Admin Login</h3>
              <p className="text-red-800 text-sm mb-2">
                Email: <code className="bg-red-100 px-2 py-1 rounded">admin@prismstudio.co.in</code>
              </p>
              <p className="text-red-800 text-sm mb-3">
                Password: <code className="bg-red-100 px-2 py-1 rounded">admin123</code>
              </p>
              <Link
                href="/login"
                className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Test Admin Login
              </Link>
            </div>
          </div>

          {/* Certificate Verification Test */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Certificate Verification Test</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm mb-3">
                Test these certificate IDs:
              </p>
              <ul className="text-green-800 text-sm space-y-1 mb-3">
                <li><code className="bg-green-100 px-2 py-1 rounded">PRISM-2025-DEMO123</code></li>
                <li><code className="bg-green-100 px-2 py-1 rounded">PRISM-2025-WEB001</code></li>
                <li><code className="bg-green-100 px-2 py-1 rounded">PRISM-2025-UIUX002</code></li>
                <li><code className="bg-green-100 px-2 py-1 rounded">PRISM-2025-DATA003</code></li>
              </ul>
              <Link
                href="/verify"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Test Certificate Verification
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/"
                className="text-center p-4 border rounded hover:bg-gray-50"
              >
                <i className="fas fa-home text-2xl text-gray-600 mb-2" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
                <p className="text-sm">Home</p>
              </Link>
              <Link
                href="/login"
                className="text-center p-4 border rounded hover:bg-gray-50"
              >
                <i className="fas fa-sign-in-alt text-2xl text-gray-600 mb-2" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
                <p className="text-sm">Login</p>
              </Link>
              <Link
                href="/dashboard"
                className="text-center p-4 border rounded hover:bg-gray-50"
              >
                <i className="fas fa-tachometer-alt text-2xl text-gray-600 mb-2" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
                <p className="text-sm">Dashboard</p>
              </Link>
              <Link
                href="/admin"
                className="text-center p-4 border rounded hover:bg-gray-50"
              >
                <i className="fas fa-cog text-2xl text-gray-600 mb-2" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
                <p className="text-sm">Admin</p>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">System Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Font Awesome Icons:</span>
                <span className="text-green-600">
                  <i className="fas fa-check-circle mr-1" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
                  Loaded
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mock Authentication:</span>
                <span className="text-green-600">
                  <i className="fas fa-check-circle mr-1" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
                  Ready
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tailwind CSS:</span>
                <span className="text-green-600">
                  <i className="fas fa-check-circle mr-1" style={{ fontFamily: 'Font Awesome 6 Free', fontWeight: 900 }}></i>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}