'use client';
import { useJobs } from '../../hooks/useJobs';
import { JobStatus, targetPlatformDisplayString } from '@/app/types/godot';
import { useState } from 'react';
import { downloadAllWorkflowArtifacts } from '@/app/utils/download';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import { capitalCase } from 'change-case';

export default function ViewBuilds() {
	const [downloadingRunId, setDownloadingRunId] = useState<number | null>(null);

	const { jobs, loading, error } = useJobs();

	if (loading) return <div>Loading…</div>;
	if (error) return <div className="error-text">Error: {error}</div>;
	if (!jobs || jobs.length === 0) return <div>No jobs found</div>;

	return (
		<div>
			<div className="warning-text" style={{ margin: '0 0 2rem' }}>
				This site is in active development.&nbsp;
				<a href="https://github.com/Yogeb-tech/gdcompile/issues">Please report any build issues</a>.
				<br />
				Builds will expire after 1 week.
				<br />
				Builds usually take approximately 30 minutes to 2 hours once started.
			</div>
			<table>
				<thead>
					<tr>
						<th scope="col">Build Name</th>
						<th scope="col">Status</th>
						<th scope="col">Target Platforms</th>
						<th scope="col">Godot Version</th>
						<th scope="col"></th>
						<th scope="col"></th>
					</tr>
				</thead>

				<tbody>
					{jobs.map((job) => (
						<BuildRow
							key={job.id}
							job={job}
							downloadingRunId={downloadingRunId}
							setDownloadingRunId={setDownloadingRunId}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}

function BuildRow({
	job,
	downloadingRunId,
	setDownloadingRunId,
}: {
	job: JobStatus;
	downloadingRunId: number | null;
	setDownloadingRunId: React.Dispatch<React.SetStateAction<number | null>>;
}) {
	const isInProgress = job.conclusion == null;
	const buildFailed = job.conclusion === 'failure';
	console.log(job);

	return (
		<tr>
			<th scope="row">{job.buildName}</th>
			<td className={job.conclusion === 'failure' ? 'error-text' : ''}>
				{!job.conclusion ? capitalCase(job.status) : capitalCase(job.conclusion)}
			</td>
			<td>{targetPlatformDisplayString(job)}</td>
			<td>{job.godotVersion}</td>
			<td>
				<DownloadAllButton
					runId={job.id}
					disabled={isInProgress || buildFailed}
					downloadingRunId={downloadingRunId}
					setDownloadingRunId={setDownloadingRunId}
				/>
			</td>
			<td>
				<DeleteButton runId={job.id} disabled={isInProgress} />
			</td>
		</tr>
	);
}

function DownloadAllButton({
	runId,
	disabled,
	downloadingRunId,
	setDownloadingRunId,
}: {
	runId: number;
	disabled: boolean;
	downloadingRunId: number | null;
	setDownloadingRunId: React.Dispatch<React.SetStateAction<number | null>>;
}) {
	const isLoading = downloadingRunId === runId;

	const handleDownloadAll = async () => {
		setDownloadingRunId(runId);

		try {
			await downloadAllWorkflowArtifacts(runId);
		} catch (error) {
			console.error('Download trigger failed: ', error);
			alert('Could not start download. Please check your network or try again.');
		} finally {
			setDownloadingRunId(null);
		}
	};

	return (
		<button
			className="outline"
			type="button"
			onClick={handleDownloadAll}
			disabled={disabled || downloadingRunId !== null}
			aria-busy={isLoading}
		>
			{!isLoading && <IconDownload />}
		</button>
	);
}

function DeleteButton({ runId, disabled }: { runId: number; disabled: boolean }) {
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
			disabled={isLoading || disabled}
			aria-busy={isLoading}
		>
			{!isLoading && <IconTrash />}
		</button>
	);
}
