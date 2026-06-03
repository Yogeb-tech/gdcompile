import { Octokit } from "@octokit/rest";
import { BuildTypes } from "../types/builds";

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

export type WorkflowDispatchParams = {
	branch: string,
	tag: string,
	LtoMode: string,
	flags: string[]
	encryptionKey: string
	platforms: string[], // Comma-separated list of platforms to build (ex: windows,web,ios,linux,macos,android)
	editorBuild: boolean,
	editorBuildMono: boolean,
	templateBuild: boolean,
	templateBuildMono: boolean,
}

// Keep old type alias for compatibility
export type GodotBranchData = GodotVersionData;

const octokit = new Octokit();

export async function fetchGodotBranches(): Promise<Branch[]> {
	try {
		const response = await octokit.repos.listBranches({
			owner: "godotengine",
			repo: "godot",
			per_page: 100
		});
		return response.data;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`API Error: ${message || 'UNKNOWN'}`);
	}
}

export async function fetchGodotTags(): Promise<Tag[]> {
	try {
		const response = await octokit.repos.listTags({
			owner: "godotengine",
			repo: "godot",
			per_page: 100
		});
		return response.data;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`API Error: ${message || 'UNKNOWN'}`);
	}
}

export async function triggerWorkflow(branchOrTag: string, params: WorkflowDispatchParams) {
	try {
		await octokit.rest.actions.createWorkflowDispatch({
			owner: 'yogeb',
			repo: 'action_godot_builder',
			workflow_id: process.env.WORKFLOW_ID!,
			ref: branchOrTag,
			inputs: params
		});

		// Wait a moment for workflow to start
		await new Promise(resolve => setTimeout(resolve, 3000));

		// Fetch ID from most recent workflow run
		const { data } = await octokit.rest.actions.listWorkflowRuns({
			owner: 'yogeb',
			repo: 'action_godot_builder',
			workflow_id: process.env.WORKFLOW_ID!,
			per_page: 1
		})

		if (data.workflow_runs.length === 0) {
			throw new Error('No workflow run found after dispatch');
		}

		return data.workflow_runs[0];
	} catch (error) {
		console.error('GitHub API error:', error);
		throw error;
	}
}

export async function getWorkflowStatus(target_run_id: number): Promise<string> {
	try {
		const { data } = await octokit.rest.actions.getWorkflowRun({
			owner: 'yogeb',
			repo: 'action_godot_builder',
			run_id: target_run_id,
		});

		if (data.status === null) {
			throw new Error('No status found from requested workflow');
		}

		return data.status;
	} catch (error) {
		console.error('GitHub API error:', error);
		throw error;
	}
}

// Add this function to your existing code

export async function downloadArtifactFromRun(target_run_id: number, artifact_name: string, destinationPath: string) {
	try {
		// List all artifacts for the specific workflow run
		const { data: artifactsData } = await octokit.rest.actions.listWorkflowRunArtifacts({
			owner: 'yogeb',
			repo: 'action_godot_builder',
			run_id: target_run_id,
		});

		if (artifactsData.artifacts.length === 0) {
			throw new Error(`No artifacts found for run ID ${target_run_id}`);
		}

		// Find the artifact by its name
		const artifact = artifactsData.artifacts.find(a => a.name === artifact_name);
		if (!artifact) {
			throw new Error(`Artifact with name "${artifact_name}" not found. Found artifacts: ${artifactsData.artifacts.map(a => a.name).join(', ')}`);
		}

		// 3. Use it to get the download URL
		const downloadResponse = await octokit.rest.actions.downloadArtifact({
			owner: 'yogeb',
			repo: 'action_godot_builder',
			artifact_id: artifact.id,
			archive_format: 'zip', // As per documentation, this must be 'zip'
		});

		// The downloadArtifact method returns a response with a `url` property.
		const artifactUrl = downloadResponse.url;

		// Download and save the file
		const fileResponse = await fetch(artifactUrl);
		if (!fileResponse.ok) {
			throw new Error(`Failed to download artifact: ${fileResponse.statusText}`);
		}

		const fileBuffer = await fileResponse.arrayBuffer();
		// TODO: You need to fetch this URL to get the actual file stream. Save `fileBuffer` to `destinationPath` using fs.writeFileSync or similar

		console.log(`Artifact "${artifact_name}" downloaded successfully to ${destinationPath}`);
		return true;

	} catch (error) {
		console.error('Error downloading artifact:', error);
		throw error;
	}
}

