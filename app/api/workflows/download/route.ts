import { NextResponse } from 'next/server';
import { getAllArtifactDownloadUrls, getReleaseDownloadUrls } from '@/app/utils/github';
import { StatusCodes } from 'http-status-codes';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const runId = searchParams.get('runId');

	if (!runId) {
		return NextResponse.json(
			{ error: 'Missing runId parameter' },
			{ status: StatusCodes.BAD_REQUEST }
		);
	}

	try {
		const artifacts = await getAllArtifactDownloadUrls(Number(runId));

		// Return urls as a JSON array instead of redirecting
		console.log(`[API] Successfully fetched ${artifacts.length} artifact URLs for runId: ${runId}`);
		return NextResponse.json({ artifacts }, { status: StatusCodes.OK });
	} catch (error) {
		console.error('Download request error: ', error);
		return NextResponse.json(
			{ error: 'Failed to generate download links' },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}
