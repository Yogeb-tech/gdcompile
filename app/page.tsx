import Form from './components/form';
import React from 'react';
import { FingerprintProvider, useVisitorData } from '@fingerprint/react';

export default function Home() {
	return (
		<>
			<React.StrictMode>
				<FingerprintProvider
					apiKey={process.env.NEXT_PUBLIC_FINGERPRINT_KEY!}
					// endpoints="https://metrics.yourwebsite.com"
					region="us"
				>
					<Form />
				</FingerprintProvider>
			</React.StrictMode>
		</>
	);
}
