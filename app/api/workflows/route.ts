import { JobStatus } from '@/app/types/godot';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import snakecaseKeys from 'snakecase-keys';
import { triggerWorkflow } from '@/app/utils/github';
import { SubmissionData } from '@/app/components/form';
import { getSupabaseAdmin } from '@/app/utils/supabase';

const supabase = getSupabaseAdmin();

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
			fingerprint,
			monoEnabled,
		} = submissionData;

		// Validate required fields
		if (!targetPlatforms || targetPlatforms.length === 0) {
			return NextResponse.json({
				error: 'At least one target platform is required',
				status: StatusCodes.BAD_REQUEST,
			});
		}

		if (!buildName) {
			return NextResponse.json({
				error: 'Build name is required',
				status: StatusCodes.BAD_REQUEST,
			});
		}

		const { count } = await supabase
			.from('jobs')
			.select('*', { count: 'exact' })
			.eq('fingerprint->>hash', fingerprint.hash)
			.is('deleted_at', null);

		console.log('Count: ', count);
		if (count && count >= 3) {
			return NextResponse.json(
				{ error: "You've reached the maximum of 3 builds per user" },
				{ status: StatusCodes.TOO_MANY_REQUESTS }
			);
		}

		// Evaluate cases for template flags
		const templateFlags = {
			runEditor: buildTarget === 'template_debug' && !monoEnabled,
			runEditorMono: buildTarget === 'template_debug' && monoEnabled,
			runTemplate: buildTarget === 'template_release' && !monoEnabled,
			runTemplateMono: buildTarget === 'template_release' && monoEnabled,
		};

		// Trigger GitHub workflow dispatch using SubmissionData
		const { id } = await triggerWorkflow('main', {
			// Map SubmissionData to workflow dispatch parameters
			tag: godotVersion,
			flags: additionalFlags,
			platforms: targetPlatforms, // Map targetPlatforms to platforms for workflow
			encryptionKey: encryptionKey,
			// Default values for workflow-specific fields
			branch: 'main',
			runEditor: templateFlags.runEditor,
			runEditorMono: templateFlags.runEditorMono,
			runTemplate: templateFlags.runTemplate,
			runTemplateMono: templateFlags.runTemplateMono,
			ltoMode: 'none',
		});

		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24);

		const job: JobStatus = {
			id: id,
			buildName: buildName,
			status: 'queued',
			createdAt: new Date().toISOString(),
			expiresAt: expiresAt.toISOString(),
			targetPlatforms: targetPlatforms,
			fingerprint: fingerprint,
		};

		const dbJob = snakecaseKeys(job as unknown as Record<string, unknown>, { deep: true });
		const { error } = await supabase.from('jobs').insert(dbJob);

		if (error) {
			console.error('supabase insert error:', error);
			return NextResponse.json({
				error: 'Failed to create build job',
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		// Build the SCons command
		console.log(`[BUILD] ${buildName} for ${targetPlatforms.join(', ')}`);
		console.log(`[GODOT] Version: ${godotVersion}`);
		console.log(`[TARGET] ${buildTarget}`);
		console.log(`[FLAGS] ${additionalFlags}`);
		if (encryptionKey) console.log(`[ENCRYPTION] Key provided`);
		console.log(JSON.stringify(job, null, 2));

		return NextResponse.json(job, { status: StatusCodes.ACCEPTED });
	} catch (error) {
		console.error('Dispatch error:', error);
		return NextResponse.json(
			{ error: 'Failed to dispatch build job' },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}

export async function GET() {
	const { data: jobs, error } = await supabase
		.from('jobs')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(10);

	if (error) {
		console.error('[API] Supabase select error: ', error);
		return Response.json({
			error: 'Failed to get build jobs',
			status: StatusCodes.INTERNAL_SERVER_ERROR,
		});
	}

	return Response.json({ jobs: jobs || [] });
}
