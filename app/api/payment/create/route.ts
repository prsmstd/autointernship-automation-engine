import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { instamojo } from '@/lib/instamojo'

// Dynamic import for Razorpay as fallback
let Razorpay: any = null
try {
  Razorpay = require('razorpay')
} catch (error) {
  console.log('Razorpay not available, using Instamojo or mock payment')
}

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()
    const supabase = createSupabaseServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, email, phone')
      .eq('id', user.id)
      .single()

    // Try Instamojo first (preferred payment method)
    if (process.env.INSTAMOJO_API_KEY && process.env.INSTAMOJO_AUTH_TOKEN) {
      try {
        const paymentRequest = await instamojo.createPaymentRequest({
          purpose: 'PrismStudio Internship Certificate',
          amount: ((amount || 9900) / 100).toString(), // Convert paise to rupees
          buyer_name: userProfile?.name || 'Student',
          email: userProfile?.email || user.email || '',
          phone: userProfile?.phone || '9999999999',
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
          allow_repeated_payments: false
        })

        if (paymentRequest.success) {
          // Save payment record
          const { error: paymentError } = await supabase
            .from('payments')
            .insert({
              user_id: user.id,
              amount: amount || 9900,
              status: 'pending',
              razorpay_order_id: paymentRequest.payment_request.id, // Using same field for Instamojo ID
              payment_method: 'instamojo'
            })

          if (paymentError) {
            console.error('Error saving payment:', paymentError)
          }

          return NextResponse.json({
            success: true,
            paymentUrl: paymentRequest.payment_request.longurl,
            provider: 'instamojo',
            orderId: paymentRequest.payment_request.id
          })
        }
      } catch (error) {
        console.error('Instamojo payment error:', error)
        // Continue to Razorpay fallback
      }
    }

    // Fallback to Razorpay if Instamojo fails or is not configured
    if (Razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && 
        process.env.RAZORPAY_KEY_ID.trim() !== '' && process.env.RAZORPAY_KEY_SECRET.trim() !== '') {
      
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        })

        // Create Razorpay order
        const order = await razorpay.orders.create({
          amount: amount || 9900, // Default ₹99 in paise
          currency: 'INR',
          receipt: `receipt_${user.id}_${Date.now()}`,
          notes: {
            user_id: user.id,
            user_name: userProfile?.name || 'Student',
            purpose: 'internship_certificate'
          }
        })

        // Save payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: user.id,
            amount: amount || 9900,
            status: 'pending',
            razorpay_order_id: order.id,
            payment_method: 'razorpay'
          })

        if (paymentError) {
          console.error('Error saving payment:', paymentError)
        }

        return NextResponse.json({ 
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          provider: 'razorpay'
        })
      } catch (dbError) {
        console.error('Razorpay error, falling back to mock payment:', dbError)
      }
    }
    
    // Fallback mock payment when both Instamojo and Razorpay are not available
    console.log('Using mock payment system')
    
    const mockOrderId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    try {
      // Save mock payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: amount || 9900,
          status: 'pending',
          razorpay_order_id: mockOrderId,
          payment_method: 'mock'
        })

      if (paymentError) {
        console.error('Error saving mock payment:', paymentError)
      }
    } catch (error) {
      console.error('Mock payment database error:', error)
    }

    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({ 
      orderId: mockOrderId,
      amount: amount || 9900,
      currency: 'INR',
      key: 'mock_key',
      provider: 'mock',
      mock: true
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' }, 
      { status: 500 }
    )
  }
}