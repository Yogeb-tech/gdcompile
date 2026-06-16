'use client';

import { useVisitorData } from '@fingerprint/react';
import { createContext, ReactNode, useContext } from 'react';
import { FingerprintData } from '../types/fingerprint';

interface VisitorContextType {
	fingerprintData: FingerprintData;
	isLoading: boolean;
	error?: Error;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

// Provider component that uses the hook
export function VisitorProvider({ children }: { children: ReactNode }) {
	const { data, isLoading, error } = useVisitorData();
	const fingerprintData: FingerprintData = {
		visitorId: data?.visitor_id,
		eventId: data?.event_id,
		timestamp: new Date().toISOString(),
	};

	return (
		<VisitorContext.Provider value={{ fingerprintData, isLoading, error }}>
			{children}
		</VisitorContext.Provider>
	);
}

// Custom hook for consuming the context (safe version)
export function useVisitorContext() {
	const context = useContext(VisitorContext);
	if (context === undefined) {
		throw new Error('useVisitorContext must be used within a VisitorProvider');
	}
	return context;
}
