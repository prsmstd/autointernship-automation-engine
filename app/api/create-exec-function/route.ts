import { createClient } from '@supabase/supabase-js';

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Create exec_sql function
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
      `
    });

    if (error) {
      // Try alternative approach using direct query
      const { error: altError } = await supabase
        .from('_dummy_table_that_does_not_exist')
        .select('*')
        .limit(0);
      
      // This will fail but let's try direct SQL execution
      return Response.json({ 
        success: false, 
        error: 'Cannot create exec function. Please run SQL manually in Supabase dashboard.',
        sql: `
          -- Run this in Supabase SQL Editor:
          ALTER TABLE users DISABLE ROW LEVEL SECURITY;
          ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
          ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
          ALTER TABLE domains DISABLE ROW LEVEL SECURITY;
          ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;
        `
      });
    }

    return Response.json({ success: true, message: 'exec_sql function created' });
  } catch (error) {
    console.error('Error creating exec function:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}