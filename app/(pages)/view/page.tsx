// TODO: Create view route so users can see their requested/pending/finished builds. Create 1 card  with 1st job from array for now. Use hardcoded visitor_id in db
'use client';
import React from 'react';
import { useJobs } from '../../hooks/useJobs';
import { useVisitorContext } from '../../components/fingerprintProvider';
import styles from './page.module.css';
import { JobStatus } from '../../types/godot';

export default function ViewBuilds() {
	const visitorContext = useVisitorContext();
	const { jobs, loading, error } = useJobs({
		visitorId: visitorContext.fingerprintData.visitorId,
		skip: !visitorContext.fingerprintData.visitorId,
	});
	// TODO: Correct card, some values don't display correctly. Also error should be a conditional render
	if (!jobs || jobs.length === 0) return <div>No jobs found</div>;

	const job = jobs[0];

	if (loading) return <div>Loading…</div>;
	if (error) return <div>Error: {error}</div>;
	return (
		<div>
			<div className={styles.grid}>
				<article className={styles.card}>
					<h2>{job.buildName}</h2>
					<div>{job.status}</div>
					<div> {job.targetPlatforms}</div>
					<div> {job.error}</div>
					<footer>DownloadFooter</footer>
				</article>
			</div>
		</div>
	);
}
