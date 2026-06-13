import { JobStatus } from "@/app/types/godot";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import snakecaseKeys from "snakecase-keys";
import { triggerWorkflow } from "@/app/utils/github";
import { SubmissionData } from "@/app/components/form";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Validate that body matches SubmissionData
		const submissionData = body as SubmissionData;

		// Extract only SubmissionData fields
		const {
			buildName,
			godotVersion,
			encryptionKey,
			targetPlatforms,
			buildTarget,
			additionalFlags,
			fingerprint
		} = submissionData;

		// Validate required fields
		if (!targetPlatforms || targetPlatforms.length === 0) {
			return NextResponse.json({
				error: 'At least one target platform is required',
				status: StatusCodes.BAD_REQUEST
			});
		}

		if (!buildName) {
			return NextResponse.json({
				error: 'Build name is required',
				status: StatusCodes.BAD_REQUEST
			});
		}

		// Trigger GitHub workflow dispatch using SubmissionData
		const { id } = await triggerWorkflow("main", {
			// Map SubmissionData to workflow dispatch parameters
			tag: godotVersion,  // Using godotVersion as the tag
			flags: additionalFlags,
			platforms: targetPlatforms,  // Map targetPlatforms to platforms for workflow
			encryptionKey: encryptionKey,
			// Default values for workflow-specific fields
			branch: "main",
			runEditor: true,
			runEditorMono: false,
			runTemplate: true,
			runTemplateMono: false,
			LtoMode: "none",  // Default or make configurable in form
		});

		// I don't need snakecase library, I can pass similar to how I passed values in trggerWorkflow()
		// Record and save user data in DB
		const job: JobStatus = {
			id: id,
			buildName: buildName,
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
		console.log(`[BUILD] ${buildName} for ${targetPlatforms.join(', ')}`);
		console.log(`[GODOT] Version: ${godotVersion}`);
		console.log(`[TARGET] ${buildTarget}`);
		console.log(`[FLAGS] ${additionalFlags}`);
		if (encryptionKey) console.log(`[ENCRYPTION] Key provided`);
		console.log(JSON.stringify(job, null, 2))

		return NextResponse.json(job, { status: StatusCodes.ACCEPTED })

	} catch (error) {
		console.error("Dispatch error:", error)
		return NextResponse.json(
			{ error: "Failed to dispatch build job" },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
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