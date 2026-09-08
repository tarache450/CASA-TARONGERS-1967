import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables with production defaults
export const SUPABASE_URL = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://cinuivjqxnsmcdqdrasy.supabase.co';

export const SUPABASE_ANON_KEY = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pmlqfv43-CD33ot2pXFtmA_apcdGV9p';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export interface SupabaseReservation {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  message?: string;
  status: 'pending' | 'contacted' | 'confirmed' | 'rejected' | 'cancelled';
  internal_notes: Array<{ id: string; text: string; author: string; createdAt: string }>;
  privacy_accepted: boolean;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseBlock {
  id: string;
  check_in: string;
  check_out: string;
  reason: string;
  created_by: string;
  created_at: string;
}

export interface SupabaseActivity {
  id: string;
  reservation_id: string | null;
  action: string;
  actor: string;
  details: Record<string, any>;
  created_at: string;
}

export interface SupabaseAdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

/**
 * Check if an email is authorized in admin_users table
 */
export async function checkAdminUser(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('email, role')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Error checking admin_users:', error.message);
      // Fallback allowed emails if table not yet initialized
      const fallbacks = ['acivit@coac.net', 'familia@casatarongers1967.com'];
      return fallbacks.includes(email.trim().toLowerCase());
    }

    return !!data;
  } catch (err) {
    console.error('[Supabase] Exception checking admin:', err);
    return false;
  }
}

/**
 * Log action in reservation_activity table
 */
export async function logReservationActivity(
  reservationId: string | null,
  action: string,
  actor: string,
  details: Record<string, any> = {}
) {
  try {
    await supabase.from('reservation_activity').insert({
      reservation_id: reservationId,
      action,
      actor,
      details,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Supabase] Could not write activity log:', err);
  }
}
