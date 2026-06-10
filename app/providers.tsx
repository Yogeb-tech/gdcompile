'use client';
import { FingerprintProvider } from '@fingerprint/react';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<FingerprintProvider apiKey={process.env.NEXT_PUBLIC_FINGERPRINT_KEY!} region="us">
			{children}
		</FingerprintProvider>
	);
}
