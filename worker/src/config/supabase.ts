import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { logger } from '../utils/logger'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  logger.error('Supabase URL or key not found in environment variables')
  process.exit(1)
}

// Create Supabase client with service role key for admin access
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
})
