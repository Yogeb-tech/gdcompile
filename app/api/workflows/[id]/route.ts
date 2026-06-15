import { deleteAllArtifactsForRun, deleteWorkflowRunAndArtifacts } from '@/app/utils/github';
import { createClient } from '@supabase/supabase-js';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

		console.log('Request ID: ', id);

		// Delete from db
		const { error } = await supabase.from('jobs').delete().eq('id', Number(id));

		if (error) {
			console.error('supabase delete error:', error);
			return NextResponse.json({
				error: `Failed to delete job`,
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		// Delete artifact from workflows
		await deleteWorkflowRunAndArtifacts(Number(id));

		return NextResponse.json({ message: 'Job deleted successfully' }, { status: StatusCodes.OK });
	} catch (error) {
		console.error('Delete error: ', error);
		return NextResponse.json(
			{ error: 'failed to delete job from db' },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}
