// TODO: Create update post request to update status from github webhooks

import { createClient } from '@supabase/supabase-js';
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

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const githubPayload = body as GitHubWebhookPayload;
		console.log('Request body:', githubPayload);
		console.log('Request headers:', Object.fromEntries(request.headers.entries()));
		return NextResponse.json({ message: 'Webhook Received' }, { status: StatusCodes.OK });
	} catch (error) {
		console.error('Update error:', error);
		return NextResponse.json(
			{ error: 'Failed to dispatch build job' },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}
