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

export function useSupportedGodotTags() {
	const result = useGodotTags();

	return {
		...result,
		tags: result.tags.filter((tag) => /^4\.(6|7)(\.\d+)?-stable$/.test(tag.name)),
	};
}
