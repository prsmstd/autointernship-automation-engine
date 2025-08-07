'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

interface PaymentModalProps {
  onClose: () => void
  onSuccess: () => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function PaymentModal({ onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createSupabaseClient()

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Create payment order
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 9900, // ₹99 in paise
        }),
      })

      const orderData = await response.json()
      
      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create payment order')
      }

      // Check if this is a mock payment (no real Razorpay)
      if (orderData.key === 'mock_razorpay_key') {
        // Simulate payment success for mock
        setTimeout(async () => {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: 'pay_mock_' + Date.now(),
                razorpay_signature: 'mock_signature',
              }),
            })

            const verifyResult = await verifyResponse.json()
            if (verifyResult.success) {
              onSuccess()
            } else {
              throw new Error('Mock payment verification failed')
            }
          } catch (error: any) {
            setError(error.message)
          } finally {
            setLoading(false)
          }
        }, 2000)
        return
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway')
      }

      // Get user profile for payment details
      const { data: userProfile } = await supabase
        .from('users')
        .select('name, email, phone')
        .eq('id', user.id)
        .single()

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'PrismStudio',
        description: 'Internship Certificate Fee',
        order_id: orderData.orderId,
        prefill: {
          name: userProfile?.name || '',
          email: userProfile?.email || user.email,
          contact: userProfile?.phone || '',
        },
        theme: {
          color: '#3d91c9',
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyResult = await verifyResponse.json()
            if (verifyResult.success) {
              onSuccess()
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error: any) {
            setError(error.message)
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Certificate Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-certificate text-green-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Get Your Certificate</h3>
            <p className="text-gray-600 text-sm">
              Complete your payment to receive your official internship certificate
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium">Certificate Fee</span>
              <span className="text-2xl font-bold text-primary-600">₹99</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              One-time payment • Secure payment via Razorpay
            </div>
          </div>

          <div className="space-y-3 mb-6 text-sm text-gray-600">
            <div className="flex items-center">
              <i className="fas fa-check text-green-500 mr-3"></i>
              Official PrismStudio certificate
            </div>
            <div className="flex items-center">
              <i className="fas fa-check text-green-500 mr-3"></i>
              Downloadable PDF format
            </div>
            <div className="flex items-center">
              <i className="fas fa-check text-green-500 mr-3"></i>
              Blockchain-verified authenticity
            </div>
            <div className="flex items-center">
              <i className="fas fa-check text-green-500 mr-3"></i>
              Shareable verification link
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-credit-card mr-2"></i>
                  Pay ₹99
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <i className="fas fa-shield-alt mr-1"></i>
              Secured by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}