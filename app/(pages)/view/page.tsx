'use client';
import { useJobs } from '../../hooks/useJobs';
import { useVisitorContext } from '../../components/fingerprintProvider';
import { JobStatus } from '@/app/types/godot';
import { useState } from 'react';
import { downloadAllWorkflowArtifacts } from '@/app/utils/download';

// TODO: Delete button must properly delete from db atleast (maybe from workflow aswell)
// TODO: Then configure RLS in supabase
// TODO: Remove the timer on the form, I think its unnecessary?
// TODO: Polish. make table look nice, add icons, etc

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
			<td>{job.status}</td>
			<td>{job.targetPlatforms}</td>
			<td>
				<DownloadAllButton runId={job.id} />
			</td>
			<td>
				<button type="button">Delete</button>
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
		<button type="button" onClick={handleDownloadAll} disabled={isLoading}>
			{/* TODO: replace with icons download and loading) */}
			{isLoading ? 'Downloading...' : 'Download'}
		</button>
	);
}
