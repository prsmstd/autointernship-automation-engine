import { createClient } from '@supabase/supabase-js';

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Fix users table policies
    await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing problematic policies
        DROP POLICY IF EXISTS "Users can view their own profile" ON users;
        DROP POLICY IF EXISTS "Users can update their own profile" ON users;
        DROP POLICY IF EXISTS "Admins can view all users" ON users;
        DROP POLICY IF EXISTS "Admins can update all users" ON users;

        -- Create simple, working policies
        CREATE POLICY "Enable read access for authenticated users" ON users
            FOR SELECT USING (auth.uid() = id OR EXISTS (
                SELECT 1 FROM users WHERE id = auth.uid() AND role = 'A'
            ));

        CREATE POLICY "Enable update for users on their own profile" ON users
            FOR UPDATE USING (auth.uid() = id OR EXISTS (
                SELECT 1 FROM users WHERE id = auth.uid() AND role = 'A'
            ));

        CREATE POLICY "Enable insert for authenticated users" ON users
            FOR INSERT WITH CHECK (auth.uid() = id);

        -- Fix tasks table policies
        DROP POLICY IF EXISTS "Enable read access for all users" ON tasks;
        CREATE POLICY "Enable read access for all users" ON tasks
            FOR SELECT USING (true);
      `
    });

    return Response.json({ success: true, message: 'RLS policies fixed' });
  } catch (error) {
    console.error('Error fixing RLS policies:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}