import { JobStatus } from "@/app/types/godot";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import snakecaseKeys from "snakecase-keys";
import { triggerWorkflow, WorkflowDispatchParams } from "@/app/utils/github";
import { SubmissionData } from "@/app/components/form";

// Store jobs in memory
// const jobs = new Map<string, JobStatus>;
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const {
			// From WorkflowDispatchParams
			branch, tag, platforms,
			editorBuild, editorBuildMono, templateBuild, templateBuildMono,
			// Shared
			// TODO: The issue is platforms, which is still a radio field instead of checklist. Adjust platforms to match targetPlatforms
			// TODO: LTO should also be prompted in the form and a shared value in both interfaces
			LtoMode, encryptionKey,
			// From SubmissionData
			targetPlatforms, buildTarget, additionalFlags, fingerprint
		} = body as WorkflowDispatchParams & SubmissionData;


		// Github workflow dispatch
		const { id } = await triggerWorkflow("main", {
			branch: branch,
			tag: tag,
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
			targetPlatforms: targetPlatforms,
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