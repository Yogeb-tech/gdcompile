'use client';
import { useJobs } from '../../hooks/useJobs';
import { useVisitorContext } from '../../components/fingerprintProvider';
import styles from './page.module.css';

// TODO: Create view route so users can see their requested/pending/finished builds. Create 1 card  with 1st job from array for now. Use hardcoded visitor_id in db
// TODO: Make sure status updates in real time, also include failure to status types if it isn't there already
// TODO: Download button must properly download artifcats from github
// TODO: Delete button must properly delete from db atleast (maybe from workflow aswell)
export default function ViewBuilds() {
	const visitorContext = useVisitorContext();
	const { jobs, loading, error } = useJobs({
		visitorId: visitorContext.fingerprintData.visitorId,
		skip: !visitorContext.fingerprintData.visitorId,
	});

	if (!jobs || jobs.length === 0) return <div>No jobs found</div>;

	const job = jobs[0];

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
						<th scope="col">Download</th>
						<th scope="col">Delete</th>
					</tr>
				</thead>

				<tbody>
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
				</tbody>
			</table>
		</div>
	);
}
