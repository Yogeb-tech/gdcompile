import { getSupabaseAdmin } from '@/app/utils/supabase';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';

interface GitHubWebhookPayload {
	action: string;
	workflow_job: {
		id: number;
		run_id: number;
		workflow_name: string;
		head_branch: string;
		run_url: string;
		run_attempt: number;
		node_id: string;
		head_sha: string;
		url: string;
		html_url: string;
		status: string;
		conclusion: null | string;
		created_at: string;
		started_at: string;
		completed_at: null | string;
		name: string;
	};
}

const supabase = getSupabaseAdmin();

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const githubPayload = body as GitHubWebhookPayload;

		console.log('[API] Request body:', githubPayload);
		console.log('[API] Request headers:', Object.fromEntries(request.headers.entries()));

		const { error } = await supabase
			.from('jobs')
			.update({
				status: githubPayload.workflow_job.status,
				completed_at: githubPayload.workflow_job.completed_at,
			})
			.eq('id', Number(githubPayload.workflow_job.run_id));

		if (error) {
			console.error('[API] supabase update error:', error);
			return NextResponse.json({
				error: `Failed to alter job`,
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		return NextResponse.json({ message: 'Webhook Received' }, { status: StatusCodes.OK });
	} catch (error) {
		console.error('[API] Update error:', error);
		return NextResponse.json(
			{ error: 'Failed to dispatch build job' },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}
