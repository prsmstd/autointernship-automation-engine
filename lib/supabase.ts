import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL
}

const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

const getSupabaseServiceKey = () => {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
}

// Client component Supabase client
export const createSupabaseClient = () => {
  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getSupabaseAnonKey()
  
  // Check if we have valid configuration
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured, using mock mode')
    // Return a mock client that won't cause errors
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Mock mode - configure Supabase for full functionality' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Mock mode - configure Supabase for full functionality' } }),
        signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Mock mode - configure Supabase for full functionality' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        resetPasswordForEmail: () => Promise.resolve({ data: null, error: { message: 'Mock mode - configure Supabase for full functionality' } })
      },
      from: () => ({
        select: () => ({ 
          eq: () => ({ 
            single: () => Promise.resolve({ data: null, error: { message: 'Database not configured' } }),
            order: () => Promise.resolve({ data: [], error: null })
          }),
          order: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Database not configured' } }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Database not configured' } }) }) }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Database not configured' } }) })
      })
    } as any
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Client-side Supabase client (lazy initialization)
let _supabase: any = null
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    if (!_supabase) {
      _supabase = createSupabaseClient()
    }
    return _supabase[prop]
  }
})

// Server-side Supabase client with service role (for admin operations)
export const createSupabaseAdmin = () => {
  const supabaseUrl = getSupabaseUrl()
  const supabaseServiceKey = getSupabaseServiceKey()
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase admin not configured, using mock mode')
    return createSupabaseClient() // Return regular client as fallback
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Server-side admin client (lazy initialization)
let _supabaseAdmin: any = null
export const supabaseAdmin = new Proxy({} as any, {
  get(_target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createSupabaseAdmin()
    }
    return _supabaseAdmin[prop]
  }
})

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          domain: string | null
          role: 'student' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string | null
          domain?: string | null
          role?: 'student' | 'admin'
        }
        Update: {
          name?: string
          email?: string
          phone?: string | null
          domain?: string | null
          role?: 'student' | 'admin'
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          domain: string
          order_number: number
          is_final: boolean
          max_score: number
          grading_criteria: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          domain: string
          order_number: number
          is_final?: boolean
          max_score?: number
          grading_criteria: string
        }
        Update: {
          title?: string
          description?: string
          domain?: string
          order_number?: number
          is_final?: boolean
          max_score?: number
          grading_criteria?: string
        }
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          task_id: string
          github_link: string
          ai_feedback: any
          score: number | null
          analysis_type: string | null
          status: 'pending' | 'evaluated' | 'approved'
          submitted_at: string
          evaluated_at: string | null
        }
        Insert: {
          user_id: string
          task_id: string
          github_link: string
          ai_feedback?: any
          score?: number | null
          analysis_type?: string | null
          status?: 'pending' | 'evaluated' | 'approved'
        }
        Update: {
          github_link?: string
          ai_feedback?: any
          score?: number | null
          analysis_type?: string | null
          status?: 'pending' | 'evaluated' | 'approved'
          evaluated_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          payment_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          amount: number
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          payment_method?: string | null
        }
        Update: {
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          payment_method?: string | null
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          certificate_id: string
          pdf_url: string
          cert_hash: string
          metadata: any
          verification_url: string | null
          issued_at: string
          created_at: string
        }
        Insert: {
          user_id: string
          certificate_id: string
          pdf_url: string
          cert_hash: string
          metadata?: any
          verification_url?: string | null
        }
        Update: {
          pdf_url?: string
          cert_hash?: string
          metadata?: any
          verification_url?: string | null
        }
      }
    }
  }
}