import { createClient } from '@supabase/supabase-js';

// Publishable key only. The secret key stays on the server.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// null until client/.env has both values; browsing works without it, sign-in won't
export const supabase = url && key ? createClient(url, key) : null;
