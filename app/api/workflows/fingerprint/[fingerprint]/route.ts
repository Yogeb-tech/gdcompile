import { createClient } from '@supabase/supabase-js';
import camelcaseKeys from 'camelcase-keys';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ fingerprint: string }> }
) {
	try {
		const { fingerprint } = await params;

		const { data: rawJobs, error } = await supabase
			.from('jobs')
			.select('*')
			.eq('fingerprint->>visitor_id', fingerprint);

		console.log(`[API]  ${fingerprint}`);
		console.log(`[API]  ${JSON.stringify(rawJobs, null, 2)}`);

		if (error) {
			console.error('Supabase error:', error);
			return NextResponse.json(
				{ error: error.message },
				{ status: StatusCodes.INTERNAL_SERVER_ERROR }
			);
		}

		// Must be converted to match interface
		const jobs = camelcaseKeys(rawJobs, { deep: true });
		return NextResponse.json({ jobs }, { status: StatusCodes.OK });
	} catch (error) {
		console.error('Unexpected error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}
