import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin(): SupabaseClient {
	if (!supabaseAdmin) {
		const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (!url || !key) {
			throw new Error('Missing Supabase admin credentials');
		}

		supabaseAdmin = createClient(url, key, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});
	}

	return supabaseAdmin;
}
