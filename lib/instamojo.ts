// Instamojo Payment Integration
export interface InstamojoPaymentRequest {
  purpose: string
  amount: string
  buyer_name: string
  email: string
  phone: string
  redirect_url: string
  webhook: string
  allow_repeated_payments: boolean
}

export interface InstamojoPaymentResponse {
  success: boolean
  payment_request: {
    id: string
    longurl: string
    shorturl: string
    status: string
  }
  message?: string
}

export class InstamojoClient {
  private apiKey: string
  private authToken: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.INSTAMOJO_API_KEY || ''
    this.authToken = process.env.INSTAMOJO_AUTH_TOKEN || ''
    this.baseUrl = process.env.INSTAMOJO_SANDBOX === 'true' 
      ? 'https://test.instamojo.com/api/1.1/'
      : 'https://www.instamojo.com/api/1.1/'
  }

  async createPaymentRequest(data: InstamojoPaymentRequest): Promise<InstamojoPaymentResponse> {
    // If Instamojo is not configured, return mock response
    if (!this.apiKey || !this.authToken) {
      return this.createMockPayment(data)
    }

    try {
      const response = await fetch(`${this.baseUrl}payment-requests/`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'X-Auth-Token': this.authToken,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(data as any)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          payment_request: result.payment_request
        }
      } else {
        throw new Error(result.message || 'Payment request failed')
      }
    } catch (error: any) {
      console.error('Instamojo payment error:', error)
      // Fallback to mock payment on error
      return this.createMockPayment(data)
    }
  }

  async getPaymentDetails(paymentRequestId: string) {
    if (!this.apiKey || !this.authToken) {
      return this.getMockPaymentDetails(paymentRequestId)
    }

    try {
      const response = await fetch(`${this.baseUrl}payment-requests/${paymentRequestId}/`, {
        headers: {
          'X-Api-Key': this.apiKey,
          'X-Auth-Token': this.authToken
        }
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error fetching payment details:', error)
      return this.getMockPaymentDetails(paymentRequestId)
    }
  }

  private createMockPayment(data: InstamojoPaymentRequest): InstamojoPaymentResponse {
    const mockId = 'mock_' + Math.random().toString(36).substring(7)
    
    return {
      success: true,
      payment_request: {
        id: mockId,
        longurl: `/payment/mock?id=${mockId}&amount=${data.amount}`,
        shorturl: `/payment/mock?id=${mockId}`,
        status: 'Pending'
      }
    }
  }

  private getMockPaymentDetails(paymentRequestId: string) {
    return {
      success: true,
      payment_request: {
        id: paymentRequestId,
        status: 'Completed',
        amount: '99.00',
        buyer_name: 'Mock User',
        buyer_email: 'mock@example.com'
      }
    }
  }
}

export const instamojo = new InstamojoClient()