import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cgytvfbukkxkdjgxvfhf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.warn('Variável de ambiente VITE_SUPABASE_ANON_KEY não encontrada. Algumas funcionalidades podem não funcionar corretamente.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'placeholder_key_to_prevent_crash_until_configured');
