import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// Prefer server-only key; fallback to public if provided for now
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) as string;

if (!serviceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Admin operations will fail.');
}

export const supabaseAdmin = createClient(supabaseUrl || '', serviceRoleKey || '');
