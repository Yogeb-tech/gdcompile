'use client';
import React from 'react';
import Form from './components/form';
import { FingerprintProvider, useVisitorData } from '@fingerprint/react';
import CenteredPage from './components/centeredPage';

export default function Home() {
	return (
		<FingerprintProvider apiKey={process.env.NEXT_PUBLIC_FINGERPRINT_KEY!} region="us">
			<AppContent />
			{/*<CenteredPage h1Text="Hello There" pText="This is a pico card" />*/}
		</FingerprintProvider>
	);
}

function AppContent() {
	const { data, isLoading } = useVisitorData({
		immediate: true,
	});

	if (isLoading) {
		return <p>Loading...</p>;
	}

	if (!data) {
		return <AdBlockDetected />;
	}

	return (
		<Form
			fingerprint={{
				visitorId: data.visitor_id!,
				requestId: data.event_id!,
				timestamp: new Date().toISOString(),
			}}
		/>
	);
}

function AdBlockDetected() {
	return <p>AdBlocker Detected...</p>;
}
