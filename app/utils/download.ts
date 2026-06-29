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

		// Create ZIP
		const zip = new JSZip();

		// Download all artifacts
		for (let i = 0; i < artifacts.length; i++) {
			const artifact = artifacts[i];
			console.log(`Downloading ${i + 1}/${artifacts.length}: ${artifact.name}`);

			const fileResponse = await fetch(artifact.url);
			if (!fileResponse.ok) {
				console.warn(`Failed to download ${artifact.name}, skipping...`);
				continue;
			}

			const blob = await fileResponse.blob();
			zip.file(`${artifact.name}`, blob);
		}

		// Generate and download single ZIP
		console.log('Creating ZIP file...');
		const zipBlob = await zip.generateAsync({
			type: 'blob',
			compression: 'DEFLATE',
			compressionOptions: { level: 6 },
		});

		saveAs(zipBlob, `workflow-${runId}-artifacts.zip`);
		console.log('Download complete!');
	} catch (error) {
		console.error('Download failed:', error);
		throw error;
	}
}
