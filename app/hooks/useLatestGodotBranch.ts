import { useState, useEffect } from 'react'
import { GodotBranchData, fetchGodotBranches, findLatestReleaseBranch } from "../utils/github"

// TODO: Use tag instead of branch

export function useLatestGodotBranch() {
	const [data, setData] = useState<GodotBranchData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	useEffect(() => {
		async function fetchData() {
			try {
				const branches = await fetchGodotBranches()
				const latestBranch = findLatestReleaseBranch(branches)
				setData(latestBranch)
			} catch (error: unknown) {
				setError(error instanceof Error ? error.message : "An unexpected error occurred")
			} finally {
				setLoading(false)
			}
		}

		fetchData();
	}, []);

	return { data, loading, error }
}