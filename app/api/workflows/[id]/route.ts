import { deleteWorkflowRunAndArtifacts } from '@/app/utils/github';
import { getSupabaseAdmin } from '@/app/utils/supabase';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';

const supabase = getSupabaseAdmin();

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

		console.log('[API] Request ID: ', id);

		// Delete from db
		const { error } = await supabase
			.from('jobs')
			.update({
				deleted_at: new Date().toISOString(),
				artifact_deleted: false, // Will update after GitHub cleanup
			})
			.eq('id', Number(id));

		if (error) {
			console.error('supabase delete error:', error);
			return NextResponse.json({
				error: `Failed to delete job`,
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}

		// Delete artifact from workflows
		await deleteWorkflowRunAndArtifacts(Number(id));

		// Mark artifact as deleted
		await supabase.from('jobs').update({ artifact_deleted: true }).eq('id', Number(id));

		return NextResponse.json({ message: 'Job deleted successfully' }, { status: StatusCodes.OK });
	} catch (error) {
		console.error('Delete error: ', error);
		return NextResponse.json(
			{ error: 'failed to delete job from db' },
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}
