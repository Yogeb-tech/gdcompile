import { deleteWorkflowRunAndArtifacts } from '@/app/utils/github';
import { getSupabaseAdmin } from '@/app/utils/supabase';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';

const supabase = getSupabaseAdmin();

export async function POST(request: Request) {
	try {
		const authHeader = request.headers.get('authorization');
		const cronSecret = process.env.CRON_SECRET;

		console.log(authHeader);
		console.log(cronSecret);
		if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
			return new Response('Unauthorized', {
				status: 401,
			});
		}

		// Find expired jobs
		const { data: expiredJobs } = await supabase
			.from('jobs')
			.select('id')
			.is('deleted_at', null)
			.lt('expires_at', new Date().toISOString());

		// Update DB
		await supabase
			.from('jobs')
			.update({ deleted_at: new Date().toISOString(), artifact_deleted: true })
			.eq(
				'id',
				expiredJobs?.map((job) => job.id)
			);

		let cleaned = 0;
		for (const job of expiredJobs || []) {
			try {
				await deleteWorkflowRunAndArtifacts(job.id);
				cleaned++;
				await supabase.from('jobs').update({ artifact_deleted: true }).eq('id', job.id);
			} catch (error) {
				console.error(`Failed to clean job ${job.id}:`, error);
			}
		}

		return NextResponse.json({
			message: `Cleaned ${cleaned} jobs`,
			cleaned,
		});
	} catch (error) {
		console.error('Cleanup error:', error);
		return NextResponse.json(
			{ error: 'Cleanup failed' },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}
