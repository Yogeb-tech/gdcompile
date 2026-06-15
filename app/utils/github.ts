import { Octokit } from '@octokit/rest';
import { TargetPlatform } from '../types/godot';

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
	name: string; // tag or branch name
	commitSha: string;
};

export type WorkflowDispatchParams = {
	branch: string;
	tag: string;
	LtoMode: string;
	flags: string;
	encryptionKey: string;
	platforms: TargetPlatform['name'][];
	runEditor: boolean;
	runEditorMono: boolean;
	runTemplate: boolean;
	runTemplateMono: boolean;
};

// Keep old type alias for compatibility
export type GodotBranchData = GodotVersionData;

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN,
});

export const MY_ORG = 'Yogeb-tech';
export const MY_REPO = 'action_godot_builder';

export async function fetchGodotBranches(): Promise<Branch[]> {
	try {
		const response = await octokit.repos.listBranches({
			owner: 'godotengine',
			repo: 'godot',
			per_page: 100,
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
			owner: 'godotengine',
			repo: 'godot',
			per_page: 100,
		});
		return response.data;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`API Error: ${message || 'UNKNOWN'}`);
	}
}

export async function fetchGodotLatestTag(): Promise<Tag> {
	try {
		const tags = await fetchGodotTags();
		return tags[0];
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`API Error: ${message || 'UNKNOWN'}`);
	}
}

export async function triggerWorkflow(branchOrTag: string, params: WorkflowDispatchParams) {
	try {
		const inputs = {
			repo: 'godotengine/godot',
			'base-branch': params.branch,
			tag: params.tag,
			tag_release: params.tag,
			module_flags: params.flags,
			template_module_flags: '',
			release_repo: '',
			lto:
				params.LtoMode === 'none'
					? 'lto=none'
					: params.LtoMode === 'thin'
						? 'lto=thin'
						: 'lto=full',
			run_editor: params.runEditor,
			run_editor_mono: params.runEditorMono,
			run_template: params.runTemplate,
			run_template_mono: params.runTemplateMono,
		};

		await octokit.rest.actions.createWorkflowDispatch({
			owner: MY_ORG,
			repo: 'action_godot_builder',
			workflow_id: process.env.WORKFLOW_ID!,
			ref: branchOrTag,
			inputs: inputs,
		});

		// Wait a moment for workflow to start
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Fetch ID from most recent workflow run
		const { data } = await octokit.rest.actions.listWorkflowRuns({
			owner: MY_ORG,
			repo: 'action_godot_builder',
			workflow_id: process.env.WORKFLOW_ID!,
			per_page: 1,
		});

		if (data.workflow_runs.length === 0) {
			throw new Error('No workflow run found after dispatch');
		}

		return data.workflow_runs[0];
	} catch (error) {
		console.error('GitHub API error:', error);
		throw error;
	}
}

// HACK: This might not be useful. Deprecated?
export async function getWorkflowStatus(target_run_id: number): Promise<string> {
	try {
		const { data } = await octokit.rest.actions.getWorkflowRun({
			owner: MY_ORG,
			repo: MY_REPO,
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

export type ArtifactDownloadInfo = {
	name: string;
	url: string;
};

export async function getAllArtifactDownloadUrls(
	target_run_id: number
): Promise<ArtifactDownloadInfo[]> {
	try {
		const { data: artifactsData } = await octokit.rest.actions.listWorkflowRunArtifacts({
			owner: MY_ORG,
			repo: MY_REPO,
			run_id: target_run_id,
		});

		if (artifactsData.artifacts.length === 0) {
			throw new Error(`No artifacts found for run ID ${target_run_id}`);
		}

		// Map through ALL artifacts and request a download URL for each concurrently
		const downloadUrlPromises = artifactsData.artifacts.map(async (artifact) => {
			const downloadResponse = await octokit.rest.actions.downloadArtifact({
				owner: MY_ORG,
				repo: MY_REPO,
				artifact_id: artifact.id,
				archive_format: 'zip',
			});

			return {
				name: artifact.name,
				url: downloadResponse.url,
			};
		});

		// Resolve all requests in parallel
		const allArtifacts = await Promise.all(downloadUrlPromises);

		return allArtifacts;
	} catch (error) {
		console.error('Error fetching all artifact URLs:', error);
		throw error;
	}
}

export async function deleteWorkflowRunAndArtifacts(target_run_id: number) {
	try {
		await deleteAllArtifactsForRun(target_run_id);
		await deleteWorkflowRun(target_run_id);
	} catch (error) {
		console.error('Error deleteing workflow and artifacts: ', error);
		throw error;
	}
}

export async function deleteWorkflowRun(target_run_id: number) {
	try {
		await octokit.rest.actions.deleteWorkflowRun({
			owner: MY_ORG,
			repo: MY_REPO,
			run_id: target_run_id,
		});
		console.log(`Deleted workflow run ${target_run_id}`);
	} catch (error) {
		console.error('Error deleting workflow: ', error);
		throw error;
	}
}

export async function deleteAllArtifactsForRun(target_run_id: number) {
	try {
		const { data: artifactsData } = await octokit.rest.actions.listWorkflowRunArtifacts({
			owner: MY_ORG,
			repo: MY_REPO,
			run_id: target_run_id,
		});

		if (artifactsData.artifacts.length === 0) {
			console.log(`No artifacts found for run ID ${target_run_id}.`);
			return;
		}

		await Promise.all(
			artifactsData.artifacts.map((artifact) =>
				deleteArtifact(artifact.id).catch((e) => {
					console.error(`Failed to delete artifact ${artifact.id}:`, e);
					return null; // Continue even if one fails
				})
			)
		);
		console.log(`Deleted artifacts for workflow run ${target_run_id}`);
	} catch (error) {
		console.error('Error deleteing all artifacts: ', error);
		throw error;
	}
}

export async function deleteArtifact(target_artifact_id: number) {
	try {
		await octokit.rest.actions.deleteArtifact({
			owner: MY_ORG,
			repo: MY_REPO,
			artifact_id: target_artifact_id,
		});
	} catch (error) {
		console.error('Error deleting artifact: ', error);
		throw error;
	}
}
