export type Branch = {
	name: string;
	commit: {
		sha: string;
		url: string;
	};
};

export type Tag = {
	name: string;
	commit: {
		sha: string;
		url: string;
	};
	zipball_url: string;
	tarball_url: string;
};

export type GodotVersionData = {
	name: string;      // tag or branch name
	commitSha: string;
};

// Keep old type alias for compatibility
export type GodotBranchData = GodotVersionData;

export async function fetchGodotBranches(): Promise<Branch[]> {
	const response = await fetch(
		"https://api.github.com/repos/godotengine/godot/branches?per_page=100",
		{ headers: { Accept: "application/vnd.github.v3+json" } }
	);
	if (!response.ok) throw new Error(`API Error: ${response.status}`);
	return response.json();
}

export async function fetchGodotTags(): Promise<Tag[]> {
	const response = await fetch(
		"https://api.github.com/repos/godotengine/godot/tags?per_page=100",
		{ headers: { Accept: "application/vnd.github.v3+json" } }
	);
	if (!response.ok) throw new Error(`API Error: ${response.status}`);
	return response.json();
}
