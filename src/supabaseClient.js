import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Inisialisasi dan export client Supabase.
 *
 * Membaca `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari environment.
 * Jika belum diset, menampilkan peringatan di console.
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL atau Anon Key belum diset di environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)