import { useState, useEffect } from 'react';
import { JobStatus } from '../types/godot';
import camelcaseKeys from 'camelcase-keys';

interface UseJobsOptions {
	visitorId?: string | null;
	skip?: boolean;
}

interface UseJobsReturn {
	jobs: JobStatus[] | null;
	loading: boolean;
	error: string | null;
}

// HACK: Refresh support?
export function useJobs({ visitorId, skip = false }: UseJobsOptions = {}): UseJobsReturn {
	const [jobs, setJobs] = useState<JobStatus[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchJobs = async () => {
			if (!visitorId || skip) return;

			try {
				setLoading(true);
				setError(null);
				const response = await fetch(`/api/dispatch/${visitorId}`);
				if (!response.ok) throw new Error('Failed to fetch jobs');
				const result = await response.json();
				setJobs(result.jobs);
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Unknown error';
				setError(message);
				console.error('Failed to fetch jobs:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchJobs();
	}, [visitorId, skip]);

	return { jobs, loading, error };
}
