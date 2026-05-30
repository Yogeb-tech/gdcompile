import { GodotBuildResponse, JobStatus } from "@/app/types/godot";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import snakecaseKeys from "snakecase-keys";

// Store jobs in memory
// const jobs = new Map<string, JobStatus>;
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const { targetPlatforms, buildTarget, encryptionKey, additionalFlags, fingerprint } = body;
		if (!targetPlatforms || !fingerprint || targetPlatforms.length === 0) {
			return NextResponse.json(
				{ error: 'Missing required fields: buildName, targetPlatforms' },
				{ status: StatusCodes.BAD_REQUEST }
			);
		}

		const jobId = crypto.randomUUID();

		const job: JobStatus = {
			id: jobId,
			status: 'queued',
			createdAt: new Date().toISOString(),
			targetPlatforms: buildTarget,
			fingerprint: fingerprint
		}

		const dbJob = snakecaseKeys(job as unknown as Record<string, unknown>, { deep: true })
		const { error } = await supabase.from('jobs').insert(dbJob)

		if (error) {
			console.error('supabase insert error:', error)
			return NextResponse.json({
				error: 'Failed to create build job',
				status: StatusCodes.INTERNAL_SERVER_ERROR
			})
		}

		// Build the SCons command
		console.log(`[BUILD] for ${targetPlatforms.join(', ')}`);
		console.log(JSON.stringify(job, null, 2))
		console.log(`[FLAGS] ${buildTarget} ${additionalFlags}`);
		if (encryptionKey) console.log(`[ENCRYPTION] Key provided`);

		// TODO: Replace with GitHub workflow dispatch
		const response: GodotBuildResponse = {
			jobId,
			status: 'queued',
			message: 'Build dispatched (mock mode)'
		};

		return NextResponse.json(response, { status: StatusCodes.ACCEPTED })

	} catch (error) {
		console.error("Dispatch error:", error)
		return NextResponse.json(
			{ error: "Job not found" },
			{ status: StatusCodes.NOT_FOUND }
		)

	}
}

export async function GET() {
	const { data: jobs, error } = await supabase
		.from('jobs')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(10)
	if (error) {
		console.error('Supabase select error: ', error)
		return Response.json({
			error: 'Failed to get build jobs',
			status: StatusCodes.INTERNAL_SERVER_ERROR
		})
	}

	return Response.json({ jobs: jobs || [] })
}