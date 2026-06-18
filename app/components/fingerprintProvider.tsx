'use client';

import { useVisitorData } from '@fingerprint/react';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { createFingerprintData, FingerprintData } from '../types/fingerprint';

interface VisitorContextType {
	fingerprintData: FingerprintData | null;
	isLoading: boolean;
	error: Error | null;
	retry: () => Promise<void>;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export function VisitorProvider({ children }: { children: ReactNode }) {
	const { data, isLoading, error, getData } = useVisitorData();

	const fingerprintData = useMemo(() => {
		if (!data) return null;
		try {
			return createFingerprintData(data);
		} catch {
			return null;
		}
	}, [data]);

	const retry = useMemo(() => {
		return async () => {
			await getData();
		};
	}, [getData]);

	const contextValue = useMemo(
		() => ({
			fingerprintData,
			isLoading,
			error: error || null,
			retry,
		}),
		[fingerprintData, isLoading, error, retry]
	);

	return <VisitorContext.Provider value={contextValue}>{children}</VisitorContext.Provider>;
}

export function useVisitorContext() {
	const context = useContext(VisitorContext);
	if (context === undefined) {
		throw new Error('useVisitorContext must be used within a VisitorProvider');
	}
	return context;
}
