import { JobStatus } from "@/app/types/godot";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import snakecaseKeys from "snakecase-keys";
import { triggerWorkflow } from "@/app/utils/github";

// Store jobs in memory
// const jobs = new Map<string, JobStatus>;
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function POST(request: Request) {
	try {
		const body = await request.json();
		// TODO: Adjust inputs in form so it covers all values
		const { targetBranch, targetTag, LtoMode, targetPlatforms, buildTarget, encryptionKey, additionalFlags, fingerprint } = body;
		if (!targetPlatforms || !fingerprint || targetPlatforms.length === 0) {
			return NextResponse.json(
				{ error: 'Missing required fields: buildName, targetPlatforms' },
				{ status: StatusCodes.BAD_REQUEST }
			);
		}

		// Determine which build types are enabled based on buildTarget
		const editorBuild = buildTarget === 'editor' || buildTarget === 'both';
		const editorBuildMono = false; // Set based on your form
		const templateBuild = buildTarget === 'template' || buildTarget === 'both';
		const templateBuildMono = false; // Set based on your form


		// Github workflow dispatch
		const { id } = await triggerWorkflow("main", {
			branch: targetBranch,
			tag: targetTag,
			LtoMode: LtoMode,
			flags: additionalFlags,
			platforms: targetPlatforms,
			encryptionKey: encryptionKey,
			editorBuild: editorBuild,
			editorBuildMono: editorBuildMono,
			templateBuild: templateBuild,
			templateBuildMono: templateBuildMono,
		});

		// Record and save user data in DB
		const job: JobStatus = {
			id: id,
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

		return NextResponse.json(job, { status: StatusCodes.ACCEPTED })

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