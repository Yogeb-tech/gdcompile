// TODO: Create update post request to update status from github webhooks

import { createClient } from '@supabase/supabase-js';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(request: Request) {
	try {
		
	} catch (error) {
		console.error('Update error:', error);
		return NextResponse.json(
			{ error: 'Failed to dispatch build job' },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}
