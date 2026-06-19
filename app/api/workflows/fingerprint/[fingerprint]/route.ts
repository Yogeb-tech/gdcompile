import { getSupabaseAdmin } from '@/app/utils/supabase';
import camelcaseKeys from 'camelcase-keys';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';

const supabase = getSupabaseAdmin();

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ fingerprint: string }> }
) {
	try {
		const { fingerprint } = await params;
		console.log(`[API]  ${fingerprint}`);

		const { data: rawJobs, error } = await supabase
			.from('jobs')
			.select('*')
			.eq('fingerprint->>hash', fingerprint)
			.is('deleted_at', null);
		console.log(`[API]  ${JSON.stringify(rawJobs, null, 2)}`);

		if (error) {
			console.error('Supabase error:', error);
			return NextResponse.json(
				{ error: error.message },
				{ status: StatusCodes.INTERNAL_SERVER_ERROR }
			);
		}

		// Must be converted to match interface
		const jobs = camelcaseKeys(rawJobs, { deep: true }).map((job) => ({
			...job,
			targetPlatforms:
				typeof job.targetPlatforms === 'string'
					? JSON.parse(job.targetPlatforms)
					: job.targetPlatforms,
		}));

		return NextResponse.json({ jobs }, { status: StatusCodes.OK });
	} catch (error) {
		console.error('Unexpected error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}
