'use client';
import { useJobs } from '../../hooks/useJobs';
import { useVisitorContext } from '../../components/fingerprintProvider';
import { JobStatus } from '@/app/types/godot';

// TODO: Download button must properly download artifcats from github
// TODO: Gray out download button when status is not completed
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
				<button type="button">Download</button>
			</td>
			<td>
				<button type="button">Delete</button>
			</td>
		</tr>
	);
}
