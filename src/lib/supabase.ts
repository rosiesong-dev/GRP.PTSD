import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!


console.log("Supabase URL:", supabaseUrl);  // 여기서 확인
console.log("Supabase Key:", supabaseAnonKey);


export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)

