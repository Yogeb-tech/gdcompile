// app/api/download/route.ts
import { NextResponse } from 'next/server';
import { getArtifactDownloadUrl } from '@/app/utils/github';
import { StatusCodes } from 'http-status-codes';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const runId = searchParams.get('runId');
	const artifactName = searchParams.get('name');

	if (!runId || !artifactName) {
		return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
	}

	try {
		const downloadUrl = await getArtifactDownloadUrl(parseInt(runId), artifactName);

		return NextResponse.redirect(downloadUrl, {
			status: StatusCodes.TEMPORARY_REDIRECT,
		});
	} catch (error) {
		console.error('Download request error: ', error);
		return NextResponse.json(
			{ error: 'Download request error' },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}
