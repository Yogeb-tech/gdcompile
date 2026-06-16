import { useVisitorData } from '@fingerprint/react';

export interface FingerprintData {
	visitorId?: string;
	eventId?: string;
	timestamp: string;
}

// TODO: Finish this at some point
/*
export function createFingerprintData(data: ReturnType<typeof getData>): FingerprintData {
	return null;
}
	*/
