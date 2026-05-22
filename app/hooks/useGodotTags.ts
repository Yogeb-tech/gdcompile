import { useState, useEffect } from 'react';
import { fetchGodotTags, Tag } from '../utils/github';

export function useGodotTags() {
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchTags() {
			try {
				const data = await fetchGodotTags();
				// Optional: sort tags semantically (stable > rc > beta, core version)
				// For now, just use as returned (alphabetical)
				setTags(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load tags');
			} finally {
				setLoading(false);
			}
		}
		fetchTags();
	}, []);

	return { tags, loading, error };
}
