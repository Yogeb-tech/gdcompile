import { createHash } from 'crypto';

export function hashData(visitorId: string): string {
	return createHash('sha256')
		.update(visitorId + process.env.FINGERPRINT_SECRET!)
		.digest('hex');
}

export function verifyData(data: string, expectedHash: string): boolean {
	return hashData(data) === expectedHash;
}

export function validateBuildFlags(flags: string, fieldName: string): void {
	if (!flags) return; // Empty flags are safe

	// Allows: letters, numbers, spaces, =, -, _, ,, and .
	// Strictly blocks: ;, &, |, $, `, >, <, \, (, ), etc.
	const safePattern = /^[a-zA-Z0-9\s=\-_\.,]*$/;

	if (!safePattern.test(flags)) {
		throw new Error(
			`Security Alert: Invalid characters detected in ${fieldName}. ` +
				`Only alphanumeric characters, spaces, '=', '-', '_', ',', and '.' are allowed.`
		);
	}
}
