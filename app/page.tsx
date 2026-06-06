'use client';
import React, { useEffect, useState } from 'react';
import Form from './components/form';
import { FingerprintProvider, useVisitorData } from '@fingerprint/react';
import CenteredPage from './components/centeredCard';
import { JobStatus } from './types/godot';

export default function Home() {
	return (
		<FingerprintProvider apiKey={process.env.NEXT_PUBLIC_FINGERPRINT_KEY!} region="us">
			<AppContent />
			{/*<CenteredPage h1Text="Hello There" pText="This is a pico card" />*/}
		</FingerprintProvider>
	);
}

function AppContent() {
	const [jobs, setJobs] = useState<JobStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { data, isLoading } = useVisitorData({
		immediate: true,
	});

	useEffect(() => {
		if (!data?.visitor_id) return;

		const fetchJobs = async () => {
			try {
				setLoading(true);
				const response = await fetch(`api/dispatch/${data.visitor_id}`);
				const result = await response.json();
				if (!response.ok) throw new Error('Failed');
				setJobs(result.jobs);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';

				setError(message);
				console.error('Failed to fetch jobs: ', err);
			} finally {
				setLoading(false);
			}
		};

		fetchJobs();
	}, [data?.visitor_id]);

	if (isLoading || loading) {
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
