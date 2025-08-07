// Secure server-side Supabase client
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { AuditLogger } from './security'

// Server-side Supabase client with proper security
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'internship-platform-server'
      }
    }
  })
}

// Admin client with service role key
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'internship-platform-admin'
      }
    }
  })
}

// Secure authentication helper
export async function getAuthenticatedUser(request?: Request) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get session from cookies if available
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken)
      
      if (error || !user) {
        const errorMessage = error?.message || 'No user found'
        await AuditLogger.log('auth_token_invalid', null, { error: errorMessage })
        return null
      }

      // Verify user exists in our database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, role, email, name')
        .eq('id', user.id)
        .single()

      if (profileError) {
        await AuditLogger.log('user_profile_not_found', user.id, { error: profileError.message })
        return null
      }

      return {
        ...user,
        profile: userProfile
      }
    }

    return null
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await AuditLogger.log('auth_error', null, { error: errorMessage })
    return null
  }
}

// Secure database operations with audit logging
export class SecureDatabase {
  private supabase: ReturnType<typeof createSupabaseServerClient>
  private userId?: string

  constructor(userId?: string) {
    this.supabase = createSupabaseServerClient()
    this.userId = userId
  }

  // Secure select with RLS enforcement
  async select(table: string, columns: string = '*', filters?: Record<string, any>) {
    try {
      let query = this.supabase.from(table).select(columns)

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data, error } = await query

      if (error) {
        await AuditLogger.log('database_select_error', this.userId || null, {
          table,
          error: error.message,
          filters
        })
        throw error
      }

      await AuditLogger.log('database_select', this.userId || null, {
        table,
        recordCount: data?.length || 0
      })

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Secure insert with validation
  async insert(table: string, data: Record<string, any>) {
    try {
      // Add audit fields
      const auditData = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: result, error } = await this.supabase
        .from(table)
        .insert(auditData)
        .select()
        .single()

      if (error) {
        await AuditLogger.log('database_insert_error', this.userId || null, {
          table,
          error: error.message,
          data: Object.keys(data)
        })
        throw error
      }

      await AuditLogger.log('database_insert', this.userId || null, {
        table,
        recordId: result?.id
      })

      return { data: result, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Secure update with validation
  async update(table: string, id: string, data: Record<string, any>) {
    try {
      // Validate UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        throw new Error('Invalid ID format')
      }

      // Add audit fields
      const auditData = {
        ...data,
        updated_at: new Date().toISOString()
      }

      const { data: result, error } = await this.supabase
        .from(table)
        .update(auditData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        await AuditLogger.log('database_update_error', this.userId || null, {
          table,
          recordId: id,
          error: error.message,
          data: Object.keys(data)
        })
        throw error
      }

      await AuditLogger.log('database_update', this.userId || null, {
        table,
        recordId: id
      })

      return { data: result, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Secure delete with validation
  async delete(table: string, id: string) {
    try {
      // Validate UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        throw new Error('Invalid ID format')
      }

      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) {
        await AuditLogger.log('database_delete_error', this.userId || null, {
          table,
          recordId: id,
          error: error.message
        })
        throw error
      }

      await AuditLogger.log('database_delete', this.userId || null, {
        table,
        recordId: id
      })

      return { error: null }
    } catch (error) {
      return { error }
    }
  }
}

// Connection pool management
class ConnectionPool {
  private static instance: ConnectionPool
  private connections: Map<string, ReturnType<typeof createSupabaseServerClient>> = new Map()
  private maxConnections = 10
  private connectionTimeout = 30000 // 30 seconds

  static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool()
    }
    return ConnectionPool.instance
  }

  getConnection(key: string = 'default'): ReturnType<typeof createSupabaseServerClient> {
    if (this.connections.has(key)) {
      return this.connections.get(key)!
    }

    if (this.connections.size >= this.maxConnections) {
      // Remove oldest connection
      const firstKey = this.connections.keys().next().value
      if (firstKey) {
        this.connections.delete(firstKey)
      }
    }

    const connection = createSupabaseServerClient()
    this.connections.set(key, connection)

    // Auto-cleanup after timeout
    setTimeout(() => {
      this.connections.delete(key)
    }, this.connectionTimeout)

    return connection
  }

  closeAll() {
    this.connections.clear()
  }
}

export const connectionPool = ConnectionPool.getInstance()