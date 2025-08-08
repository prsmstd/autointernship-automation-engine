-- Fix RLS policies for proper authentication
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

-- Fix submissions table policies  
DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;

CREATE POLICY "Enable read access for authenticated users" ON submissions
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'A')
    );

CREATE POLICY "Enable insert for authenticated users" ON submissions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update for users on their own submissions" ON submissions
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'A')
    );