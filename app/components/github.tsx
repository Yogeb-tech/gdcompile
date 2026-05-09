import { useState, useEffect } from "react";

type Branch = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
};

type GodotBranchData = {
  branchName: string;
  commitSha: string;
};

function useGitHub() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://docs.github.com/en/free-pro-team@latest/rest",
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("API Error");

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  return { data, loading, error };
}

function findLatestGodotBranch() {
  const [data, setData] = useState<GodotBranchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://api.github.com/repos/godotengine/godot/branches?per_page=100",
          {
            headers: { Accept: "application/vnd.github.v3+json" },
          },
        );

        if (!response.ok) throw new Error("API Error");

        const branches = (await response.json()) as Branch[];

        // Filter out master
        const releaseBranches = branches.filter(
          (branch) => branch.name !== "master",
        );

        const latestReleaseBranch = releaseBranches[releaseBranches.length - 1];

        setData({
          branchName: latestReleaseBranch.name,
          commitSha: latestReleaseBranch.commit.sha,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  return { data, loading, error };
}

// Usage in a component
function GitHubComponent() {
  const { data, loading, error } = useGitHub();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default GitHubComponent;
