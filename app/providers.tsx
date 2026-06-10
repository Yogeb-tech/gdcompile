'use client';
import { FingerprintProvider } from '@fingerprint/react';
import { VisitorProvider } from './components/fingerprintProvider';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		// Fingerprint Provider must always come first
		<FingerprintProvider apiKey={process.env.NEXT_PUBLIC_FINGERPRINT_KEY!} region="us">
			<VisitorProvider>{children}</VisitorProvider>
		</FingerprintProvider>
	);
}
