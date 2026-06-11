export type TargetPlatform = {
	id: number;
	name: 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'Web';
};

export interface JobStatus {
	id: number;
	buildName: string;
	status: 'queued' | 'building' | 'completed' | 'failed';
	createdAt: string;
	completedAt?: string;
	downloadUrl?: string;
	error?: string;
	targetPlatforms: TargetPlatform['name'][];
	fingerprint: FingerprintData;
}
