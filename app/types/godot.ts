export type TargetPlatform = {
	id: number;
	name: 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'Web';
};

export interface JobStatus {
	id: number;
	buildName: string;
	godotVersion: string;
	status: string;
	createdAt: string;
	completedAt?: string;
	downloadUrl?: string;
	expiresAt: string;
	conclusion?: string;
	targetPlatforms: TargetPlatform['name'][];
	sessionId?: string;
}

export function targetPlatformDisplayString(job: JobStatus): string {
	const text = job.targetPlatforms.join(', ');
	return text;
}
