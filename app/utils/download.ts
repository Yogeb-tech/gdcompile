export type Artifact = {
	name: string;
	url: string;
};

export async function downloadAllWorkflowArtifacts(runId: number): Promise<void> {
	const response = await fetch(`/api/workflows/download?runId=${runId}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch artifact links: ${response.statusText}`);
	}

	const data = await response.json();
	const artifacts = data.artifacts as Artifact[];

	artifacts.forEach((artifact) => {
		const link = document.createElement('a');
		link.href = artifact.url;
		link.setAttribute('download', `${artifact.name}.zip`);

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link); // Clean up DOM
	});
}
