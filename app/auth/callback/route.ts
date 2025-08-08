import { createSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('Auth callback received:', { code: !!code, origin })

  if (code) {
    const supabase = createSupabaseClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`)
      }

      if (data.user) {
        console.log('User authenticated via OAuth:', data.user.email)
        
        // Try to create/update user profile
        try {
          const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (!existingProfile) {
            console.log('Creating new user profile')
            await supabase
              .from('users')
              .insert({
                id: data.user.id,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
                email: data.user.email || '',
                role: 'student'
              })
          }

          console.log('Redirecting to dashboard')
          return NextResponse.redirect(`${origin}/dashboard`)
        } catch (dbError) {
          console.warn('Database not available, proceeding with auth only:', dbError)
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }
    } catch (error) {
      console.error('OAuth exchange error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed&message=${encodeURIComponent('OAuth exchange failed')}`)
    }
  }

  console.log('No code provided, redirecting to login')
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}