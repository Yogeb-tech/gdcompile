'use client';
import { useJobs } from '../../hooks/useJobs';
import { useVisitorContext } from '../../components/fingerprintProvider';
import { JobStatus, targetPlatformDisplayString } from '@/app/types/godot';
import { useState } from 'react';
import { downloadAllWorkflowArtifacts } from '@/app/utils/download';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import { capitalCase } from 'change-case';

// TODO: Builds should expire in a month
// TODO: check action_godot_builder -> finish project

export default function ViewBuilds() {
	const { fingerprintData } = useVisitorContext();

	const { jobs, loading, error } = useJobs({
		visitorId: fingerprintData?.hash ?? undefined,
		skip: fingerprintData === null || fingerprintData.hash === null,
	});

	if (loading) return <div>Loading…</div>;
	if (error) return <div className="error-text">Error: {error}</div>;
	if (!jobs || jobs.length === 0) return <div>No jobs found</div>;

	return (
		<div>
			<div className="warning-text" style={{ margin: '0 0 2rem' }}>
				This site is in active development.&nbsp;
				<a href="https://github.com/Yogeb-tech/gdcompile/issues">Please report any build issues</a>.
			</div>
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
