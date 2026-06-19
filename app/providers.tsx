'use client';
import { FingerprintProvider } from '@fingerprint/react';
import { VisitorProvider } from './components/fingerprintProvider';
import { Analytics } from '@vercel/analytics/next';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		// Fingerprint Provider must always come first
		<FingerprintProvider
			apiKey={process.env.NEXT_PUBLIC_FINGERPRINT_KEY!}
			region="us"
			cache={{
				storage: 'localStorage',
				duration: 'optimize-cost',
			}}
		>
			<VisitorProvider>{children}</VisitorProvider>
			<Analytics />
		</FingerprintProvider>
	);
}
