import { useVisitorData } from '@fingerprint/react';
import { hashData, verifyData } from '../utils/security';

export interface FingerprintData {
	hash: string;
}

type VisitorData = NonNullable<ReturnType<typeof useVisitorData>['data']>;

export function createFingerprintData(data: VisitorData): FingerprintData | null {
	if (!data.visitor_id) {
		return null;
	}

	return {
		hash: hashData(data.visitor_id),
	};
}

export function verifyFingerprintData(data: FingerprintData, expectedHash: string): boolean {
	return verifyData(data.hash, expectedHash);
}
