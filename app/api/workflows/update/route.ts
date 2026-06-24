import { getSupabaseAdmin } from '@/app/utils/supabase';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { Webhooks } from '@octokit/webhooks';

const webhooks = new Webhooks({
	secret: process.env.WEBHOOK_SECRET!,
});

interface GitHubWorkflowRunPayload {
	action: string;
	workflow_run: {
		id: number;
		name: string;
		head_branch: string;
		head_sha: string;
		status: string;
		conclusion: string | null; // 'success', 'failure', 'cancelled', etc.
		created_at: string;
		updated_at: string;
		run_started_at: string;
		run_attempt: number;
		html_url: string;
	};
}

const supabase = getSupabaseAdmin();

export async function POST(request: Request) {
	try {
		const rawBody = await request.text();

		const signature = request.headers.get('x-hub-signature-256');
		if (!signature || !(await webhooks.verify(rawBody, signature))) {
			NextResponse.json({
				error: 'not allowed',
				status: StatusCodes.METHOD_NOT_ALLOWED,
			});
			return;
		}

		const githubPayload = JSON.parse(rawBody) as GitHubWorkflowRunPayload;

		console.log(`[API] Workflow status: ${githubPayload.workflow_run.status}`);
		const { error } = await supabase
			.from('jobs')
			.update({
				status: githubPayload.workflow_run.status,
				completed_at: githubPayload.workflow_run.updated_at,
			})
			.eq('id', Number(githubPayload.workflow_run.id));

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
