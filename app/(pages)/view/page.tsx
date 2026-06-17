'use client';
import { useJobs } from '../../hooks/useJobs';
import { useVisitorContext } from '../../components/fingerprintProvider';
import { JobStatus, targetPlatformDisplayString } from '@/app/types/godot';
import { useState } from 'react';
import { downloadAllWorkflowArtifacts } from '@/app/utils/download';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import { capitalCase } from 'change-case';

// TODO: Add links to proper pages
// TODO: Address the fact users could delete as a job is being queued, or download as a job is being deleted
// TODO: Add landing page (no fingerprint check, notify users about fingerprint check and experimental status), move form to /form route (add custom layout) to address no fingerprint requirement
// TODO: Make sure release dropdown menu properly recoginizes build target release, editor, both

export default function ViewBuilds() {
	const visitorContext = useVisitorContext();
	const { jobs, loading, error } = useJobs({
		visitorId: visitorContext.fingerprintData.visitorId,
		skip: !visitorContext.fingerprintData.visitorId,
	});

	if (!jobs || jobs.length === 0) return <div>No jobs found</div>;

	if (loading) return <div>Loading…</div>;
	if (error) return <div>Error: {error}</div>;
	return (
		<div>
			<table>
				<thead>
					<tr>
						<th scope="col">Build Name</th>
						<th scope="col">Status</th>
						<th scope="col">Target Platforms</th>
						<th scope="col"></th>
						<th scope="col"></th>
					</tr>
				</thead>

				<tbody>
					{jobs.map((job) => (
						<BuildRow key={job.id} job={job} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function BuildRow({ job }: { job: JobStatus }) {
	return (
		<tr>
			<th scope="row">{job.buildName}</th>
			<td className={job.status === 'failure' ? 'error-text' : ''}>{capitalCase(job.status)}</td>
			<td>{targetPlatformDisplayString(job)}</td>
			<td>
				<DownloadAllButton runId={job.id} />
			</td>
			<td>
				<DeleteButton runId={job.id} />
			</td>
		</tr>
	);
}

function DownloadAllButton({ runId }: { runId: number }) {
	const [isLoading, setIsLoading] = useState(false);

	const handleDownloadAll = async () => {
		setIsLoading(true);
		try {
			await downloadAllWorkflowArtifacts(runId);
		} catch (error) {
			console.error('Download trigger failed: ', error);
			alert('Could not start download. Please check your network or try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			className="outline"
			type="button"
			onClick={handleDownloadAll}
			disabled={isLoading}
			aria-busy={isLoading}
		>
			{!isLoading && <IconDownload />}
		</button>
	);
}

function DeleteButton({ runId }: { runId: number }) {
	const [isLoading, setIsLoading] = useState(false);

	const handleDelete = async () => {
		setIsLoading(true);
		try {
			await fetch(`/api/workflows/${runId}`, {
				method: 'DELETE',
			});
			// Reload the page to reflect the deletion
			window.location.reload();
		} catch (error) {
			console.error('Delete trigger failed: ', error);
			alert('Could not delete workflow. Please check your network or try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			className="outline btn-red"
			type="button"
			onClick={handleDelete}
			disabled={isLoading}
			aria-busy={isLoading}
		>
			{!isLoading && <IconTrash />}
		</button>
	);
}
