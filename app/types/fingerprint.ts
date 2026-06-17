import { useVisitorData } from '@fingerprint/react';

export interface FingerprintData {
	visitorId?: string;
	eventId?: string;
	timestamp: string;
}

type VisitorData = ReturnType<typeof useVisitorData>['data'];

// TODO: Use this across codebase
export function toFingerprintData(data: VisitorData | undefined): FingerprintData {
	return {
		visitorId: data?.visitor_id,
		eventId: data?.event_id,
		timestamp: new Date().toISOString(),
	};
}
