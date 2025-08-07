import { createSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createSupabaseClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/login?error=auth_failed`)
      }

      if (data.user) {
        // Check if user profile exists, create if not
        try {
          const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (!existingProfile) {
            // Create new user profile
            await supabase
              .from('users')
              .insert({
                id: data.user.id,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
                email: data.user.email || '',
                role: 'student'
              })
          }

          // Redirect to dashboard
          return NextResponse.redirect(`${origin}/dashboard`)
        } catch (dbError) {
          console.warn('Database not available, proceeding with auth only')
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }
    } catch (error) {
      console.error('OAuth exchange error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}/login`)
}