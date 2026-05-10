export type Branch = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
};

export type GodotBranchData = {
  branchName: string;
  commitSha: string;
};

export async function fetchGodotBranches(): Promise<Branch[]> {
  const response = await fetch(
    "https://api.github.com/repos/godotengine/godot/branches?per_page=100",
    { headers: { Accept: "application/vnd.github.v3+json" } }
  );
  
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  
  return response.json();
}

export function findLatestReleaseBranch(branches: Branch[]): GodotBranchData {
  const releaseBranches = branches.filter(
    (branch) => branch.name !== "master"
  );
  
  const latest = releaseBranches[releaseBranches.length - 1];
  
  return {
    branchName: latest.name,
    commitSha: latest.commit.sha,
  };
}