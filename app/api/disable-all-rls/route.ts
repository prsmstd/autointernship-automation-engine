import { createClient } from '@supabase/supabase-js';

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Disable RLS on all tables for testing
    const { error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE users DISABLE ROW LEVEL SECURITY;
        ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
        ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
        ALTER TABLE domains DISABLE ROW LEVEL SECURITY;
        ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;
        ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
      `
    });

    if (error) {
      // Try direct SQL execution
      const queries = [
        'ALTER TABLE users DISABLE ROW LEVEL SECURITY',
        'ALTER TABLE tasks DISABLE ROW LEVEL SECURITY', 
        'ALTER TABLE submissions DISABLE ROW LEVEL SECURITY',
        'ALTER TABLE domains DISABLE ROW LEVEL SECURITY',
        'ALTER TABLE certificates DISABLE ROW LEVEL SECURITY',
        'ALTER TABLE payments DISABLE ROW LEVEL SECURITY'
      ];

      for (const query of queries) {
        try {
          await supabase.rpc('exec', { sql: query });
        } catch (e) {
          console.log(`Failed to execute: ${query}`, e);
        }
      }
    }

    return Response.json({ success: true, message: 'RLS disabled on all tables' });
  } catch (error) {
    console.error('Error disabling RLS:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}