// HACK: Unused file
import { useState, useEffect } from 'react';
import { Branch, fetchGodotBranches } from '../utils/github';

export function useGodotBranchs() {
	const [Branchs, setBranches] = useState<Branch[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchBranchs() {
			try {
				const data = await fetchGodotBranches();
				// HACK: sort Branches semantically (stable > rc > beta, core version)
				// For now, just use as returned (alphabetical)
				setBranches(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load Branchs');
			} finally {
				setLoading(false);
			}
		}
		fetchBranchs();
	}, []);

	return { Branchs, loading, error };
}
