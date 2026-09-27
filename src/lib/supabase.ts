import { createClient } from '@supabase/supabase-js'
import { auth } from '../firebase'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
export const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Les variables Supabase sont absentes de .env.local')
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  accessToken: async () => auth.currentUser?.getIdToken(false) ?? null,
})
