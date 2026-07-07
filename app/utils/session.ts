import { getSupabaseAdmin } from './supabase';

// TODO: Re-evaluate fingerprinting strategy. Currently using cookies only. Consider fingerprint for MFA or session recovery if cookies are cleared or smth.
// TODO: If I don't find a use case for fingeprint just deprecate and remove it

const supabase = getSupabaseAdmin();
const SESSION_COOKIE_NAME = '__HOST-gdcompile_session_id';
const SESSION_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export function getSessionCookieHeader(sessionId: string): string {
	return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Strict`;
}

export function extractSessionIdFromCookie(cookieHeader?: string): string | null {
	if (!cookieHeader) return null;

	const cookies = cookieHeader.split(';').map((c) => c.trim());
	for (const cookie of cookies) {
		if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
			return cookie.substring(`${SESSION_COOKIE_NAME}=`.length);
		}
	}
	return null;
}

export async function getOrCreateSession(
	request: Request,
	fingerprintScore?: number
): Promise<{ sessionId: string; isNew: boolean; setCookie: string }> {
	const cookieHeader = request.headers.get('cookie');
	const existingSessionId = cookieHeader ? extractSessionIdFromCookie(cookieHeader) : null;

	if (existingSessionId) {
		// Update last_accessed_at for existing session
		await supabase
			.from('sessions')
			.update({ last_accessed_at: new Date().toISOString() })
			.eq('id', existingSessionId);

		return {
			sessionId: existingSessionId,
			isNew: false,
			setCookie: getSessionCookieHeader(existingSessionId),
		};
	}

	// Create new session
	const newSessionId = crypto.randomUUID();
	const now = new Date().toISOString();

	const { error } = await supabase.from('sessions').insert({
		id: newSessionId,
		created_at: now,
		last_accessed_at: now,
		fingerprint_score: fingerprintScore || null,
		ip_hash: null, // Could be populated later
	});

	if (error) {
		throw new Error(`Failed to create session: ${error.message}`);
	}

	return {
		sessionId: newSessionId,
		isNew: true,
		setCookie: getSessionCookieHeader(newSessionId),
	};
}
