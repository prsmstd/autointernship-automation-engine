#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * This script will create all necessary tables and data for the internship platform
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...')
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📄 Executing database schema...')
    
    // Execute the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      // Try alternative method - split and execute statements
      console.log('⚠️  Trying alternative execution method...')
      
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      
      console.log(`📝 Executing ${statements.length} SQL statements...`)
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';'
        
        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
          if (stmtError) {
            console.log(`⚠️  Statement ${i + 1} warning:`, stmtError.message)
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} error:`, err.message)
        }
      }
    } else {
      console.log('✅ Schema executed successfully')
    }
    
    // Verify tables were created
    console.log('🔍 Verifying tables...')
    
    const tables = ['users', 'tasks', 'submissions', 'payments', 'certificates']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}' not found or accessible:`, error.message)
      } else {
        console.log(`✅ Table '${table}' verified`)
      }
    }
    
    // Check if tasks were inserted
    const { data: taskCount, error: taskError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact' })
    
    if (taskError) {
      console.log('❌ Could not verify tasks:', taskError.message)
    } else {
      console.log(`✅ Found ${taskCount.length} tasks in database`)
      
      // Show task distribution by domain
      const domains = {}
      taskCount.forEach(task => {
        domains[task.domain] = (domains[task.domain] || 0) + 1
      })
      
      console.log('📊 Task distribution by domain:')
      Object.entries(domains).forEach(([domain, count]) => {
        console.log(`   ${domain}: ${count} tasks`)
      })
    }
    
    console.log('\n🎉 Database setup completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Run: npm run dev')
    console.log('2. Visit: http://localhost:3000')
    console.log('3. Sign up for a new account')
    console.log('4. Start testing the platform')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

// Run setup
setupDatabase()