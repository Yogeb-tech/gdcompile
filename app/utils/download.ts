import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export type Artifact = {
	name: string;
	url: string;
};

export async function downloadAllWorkflowArtifacts(runId: number): Promise<void> {
	try {
		// Fetch artifact URLs
		const response = await fetch(`/api/workflows/download?runId=${runId}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch artifact links: ${response.statusText}`);
		}

		const data = await response.json();
		const artifacts = data.artifacts as Artifact[];

		if (artifacts.length === 0) {
			console.warn('No artifacts found');
			return;
		}

		// Download all artifacts
		for (let i = 0; i < artifacts.length; i++) {
			const artifact = artifacts[i];
			console.log(`Downloading ${i + 1}/${artifacts.length}: ${artifact.name}`);

			const link = document.createElement('a');
			link.href = artifact.url;
			link.setAttribute('download', `${artifact.name}.zip`);
			link.style.display = 'none';

			document.body.appendChild(link);
			link.click();

			// Cleanup
			setTimeout(() => document.body.removeChild(link), 100);

			// Wait between downloads to avoid browser throttling
			//if (i < artifacts.length - 1) {
			//	await new Promise((resolve) => setTimeout(resolve, 300));
			//}
		}

		console.log('Download complete!');
	} catch (error) {
		console.error('Download failed:', error);
		throw error;
	}
}
