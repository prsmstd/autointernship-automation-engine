import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    return Response.json({ profile });
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}