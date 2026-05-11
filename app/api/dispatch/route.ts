import { GodotBuildResponse, JobStatus } from "@/app/types/godot";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

// Store jobs in memory
const jobs = new Map<string, JobStatus>;

export async function POST(request: Request){
	try {
		const body = await request.json();
		
		const {buildName, targetPlatforms, buildTarget, encryptionKey, additionalFlags } = body;
		if (!buildName || !targetPlatforms || targetPlatforms.length === 0) {
			return NextResponse.json(
				{ error: 'Missing required fields: buildName, targetPlatforms' },
				{ status: StatusCodes.BAD_REQUEST }
			);
    	}

		const jobId = crypto.randomUUID();

		const job: JobStatus = { 
			id: jobId, 
			buildName: buildName,
			status: 'queued', 
			createdAt: new Date().toISOString(),
			targetPlatforms: buildTarget
		}

		jobs.set(jobId, job);

		// Build the SCons command
		console.log(`[BUILD] ${buildName} for ${targetPlatforms.join(', ')}`);
		console.log(`[FLAGS] ${buildTarget} ${additionalFlags}`);
		if (encryptionKey) console.log(`[ENCRYPTION] Key provided`);

		// TODO: Replace with GitHub workflow dispatch
		const response: GodotBuildResponse = {
			jobId,
			status: 'queued',
			message: 'Build dispatched (mock mode)'
		};

		return NextResponse.json(response, {status: StatusCodes.ACCEPTED})

	} catch (error) {
		console.error("Dispatch error: ", error)
		return NextResponse.json(
			{error: "Job not found"}, 
			{status: StatusCodes.NOT_FOUND}
		)
		
	}
}

export async function GET(request: Request){
	const recentJobs = Array.from(jobs.values()).slice(-10);
	return Response.json({jobs: recentJobs})
}