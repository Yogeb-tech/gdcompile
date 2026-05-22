import { useState, useEffect } from "react";
import { fetchGodotTags, findLatestReleaseTag, GodotVersionData } from "../utils/github";

export function useLatestGodotBranch() {
	const [data, setData] = useState<GodotVersionData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchData() {
			try {
				const tags = await fetchGodotTags();
				const latestTag = findLatestReleaseTag(tags);
				setData(latestTag);
			} catch (error: unknown) {
				setError(
					error instanceof Error ? error.message : "An unexpected error occurred"
				);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	return { data, loading, error };
}