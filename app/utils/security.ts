import { createHash } from 'crypto';

export function hashData(visitorId: string): string {
	return createHash('sha256')
		.update(visitorId + process.env.FINGERPRINT_SECRET!)
		.digest('hex');
}

export function verifyData(data: string, expectedHash: string): boolean {
	return hashData(data) === expectedHash;
}
