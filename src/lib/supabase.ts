import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertPublicEnv() {
	if (!supabaseUrl) {
		throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local.');
	}
	if (!supabaseAnonKey) {
		throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to .env.local.');
	}
}

export function createSupabaseBrowserClient(): SupabaseClient {
	return createClientComponentClient();
}

export function createClientComponentClient(): SupabaseClient {
	assertPublicEnv();
	return createClient(supabaseUrl!, supabaseAnonKey!);
}

export function createServerComponentClient(cookieStore: unknown): SupabaseClient {
	assertPublicEnv();
	return createServerClient(supabaseUrl!, supabaseAnonKey!, {
		cookies: {
			getAll() {
				if (typeof cookieStore === 'object' && cookieStore !== null && 'getAll' in cookieStore && typeof (cookieStore as Record<string, unknown>).getAll === 'function') {
					return ((cookieStore as Record<string, unknown>).getAll as () => Array<{ name: string; value: string }>)();
				}
				return [];
			},
			setAll(cookiesToSet: Array<{ name: string; value: string; options?: unknown }>) {
				if (typeof cookieStore !== 'object' || cookieStore === null || typeof (cookieStore as Record<string, unknown>).set !== 'function') {
					return;
				}
				cookiesToSet.forEach(({ name, value, options }) => {
					(cookieStore as Record<string, unknown>).set(name, value, options);
				});
			},
		},
	});
}

export function createSupabaseServerClient(cookies: unknown): SupabaseClient {
	return createServerComponentClient(cookies);
}

export function createSupabaseAdminClient(): SupabaseClient {
	assertPublicEnv();
	if (!supabaseServiceRoleKey) {
		throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local.');
	}

	return createClient(supabaseUrl!, supabaseServiceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}

// Backward-compatible client used by existing client-side modules.
assertPublicEnv();
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
