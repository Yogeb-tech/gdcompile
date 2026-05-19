'use client';
import camelCase from 'camelcase';
import { ChangeEvent, useState } from 'react';
import { useLatestGodotBranch } from '../hooks/useLatestGodotBranch';
import styles from './form.module.css';
import { TargetPlatform } from '../types/godot';
import { useVisitorData } from '@fingerprint/react';

interface SubmissionData {
	fingerprint: {
		visitorId: string | undefined;
		requestId: string;
		timestamp: string;
	};
	buildName: string;
	godotVersion: string;
	encryptionKey: string;
	targetPlatforms: ('Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'Web')[];
	buildTarget: 'template_release' | 'template_debug';
	additionalFlags: string;
}

interface GodotFlags {
	buildName: string;
	godotVersion: string;
	encryptionKey: string;
	targetPlatforms: TargetPlatform['name'][];
	buildTarget: 'template_release' | 'template_debug';
	additionalFlags: string;
}

const platforms: TargetPlatform[] = [
	{ id: 1, name: 'Windows' },
	{ id: 2, name: 'macOS' },
	{ id: 3, name: 'Linux' },
	{ id: 4, name: 'Android' },
	{ id: 5, name: 'iOS' },
	{ id: 6, name: 'Web' },
];

export default function Form() {
	const { data, loading, error } = useLatestGodotBranch();
	const { getData } = useVisitorData({ immediate: false }); // Fingerprint hook
	const [formData, setFormData] = useState<GodotFlags>({
		buildName: 'my-godot-template',
		godotVersion: '',
		encryptionKey: '',
		targetPlatforms: [],
		buildTarget: 'template_release',
		additionalFlags: '',
	});

	function handleFormChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
		const { name, value, type } = e.target;
		const target = e.target as HTMLInputElement;
		const checked = target.checked;

		if (name === 'targetPlatforms') {
			setFormData({ ...formData, targetPlatforms: [value as any] });
			return;
		}

		setFormData({
			...formData,
			[name]: type === 'checkbox' ? checked : value,
		});
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		try {
			const { visitor_id, event_id } = await getData();

			// Combine form with fingerprint
			const submissionData: SubmissionData = {
				...formData,
				fingerprint: {
					visitorId: visitor_id,
					requestId: event_id,
					timestamp: new Date().toISOString(),
				},
			};

			console.log('SUBMISSION WITH FINGERPRINT:\n' + JSON.stringify(submissionData, null, 2));

			// Make dispatch api call
		} catch (error) {
			console.error('Submission failed:', error);
			alert('Failed to submit. Please try again.');
		}
	}

	return (
		<div className={styles.container}>
			<h1 className="title">GDCompile</h1>
			<form onSubmit={handleSubmit}>
				<div className={styles.formGroup}>
					<div>
						<label>For Godot Latest:</label>
						<p className="versionDisplay">{data?.branchName}</p>
					</div>
				</div>

				<div className={styles.formGroup}>
					<label htmlFor="buildName">Build Name</label>
					<input
						type="text"
						name="buildName"
						id="buildName"
						onChange={handleFormChange}
						defaultValue={formData.buildName}
					/>
				</div>

				<div className={styles.formGroup}>
					<label htmlFor="encryptionKey">Encryption Key (Not Required)</label>
					<input
						type="text"
						name="encryptionKey"
						id="encryptionKey"
						onChange={handleFormChange}
						value={formData.encryptionKey}
					/>
				</div>

				<div className={styles.formGroup}>
					<label htmlFor="buildTarget">Build Target (all platforms)</label>
					<select
						name="buildTarget"
						id="buildTarget"
						onChange={handleFormChange}
						value={formData.buildTarget}
					>
						<option value="template_release">Release</option>
						<option value="template_debug">Debug</option>
					</select>
				</div>

				<div className={styles.formGroup}>
					<label htmlFor="additionalFlags">Additional SCons flags</label>
					<input
						type="text"
						name="additionalFlags"
						id="additionalFlags"
						onChange={handleFormChange}
						value={formData.additionalFlags}
						placeholder="optimize=size lto=full disable_3d=yes"
					/>
					<small>
						Space-separated key=value flags. Web options specific options like javascript_eval,
						threads, dlink_enabled should also go here.
					</small>
				</div>

				<fieldset className={styles.platformsGrid}>
					<legend>Target Platforms</legend>
					{platforms.map((platform) => (
						<div key={platform.id}>
							<label htmlFor={camelCase(platform.name)}>{platform.name}</label>
							<input
								type="radio"
								name="targetPlatforms"
								value={platform.name}
								onChange={handleFormChange}
								checked={formData.targetPlatforms.includes(platform.name)}
								className="platformItem"
							/>
						</div>
					))}
				</fieldset>

				<button type="submit">Generate</button>
			</form>
		</div>
	);
}
