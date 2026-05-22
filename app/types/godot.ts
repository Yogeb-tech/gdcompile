export type TargetPlatform = {
	id: number;
	name: "Windows" | "macOS" | "Linux" | "Android" | "iOS" | "Web";
};

export interface GodotBuildRequest {
	buildName: string;
	/** 
	 * Godot version tag (not branch). 
	 * Examples: "4.3-stable", "4.2.1-rc2", "4.4-beta1"
	 */
	godotVersion: string;
	encryptionKey: string;
	targetPlatforms: TargetPlatform["name"][];
	buildTarget: "template_release" | "template_debug";
	additionalFlags: string;
}

export interface GodotBuildResponse {
	jobId: string;
	status: 'queued' | 'building' | 'completed' | 'failed';
	message?: string;
}

export interface JobStatus {
	id: string;
	status: 'queued' | 'building' | 'completed' | 'failed';
	createdAt: string;
	completedAt?: string;
	downloadUrl?: string;
	error?: string;
	buildName: string;
	targetPlatforms: TargetPlatform["name"][];
	fingerprint: {
		visitorId: string | undefined;
		requestId: string;
		timestamp: string;
	};
}