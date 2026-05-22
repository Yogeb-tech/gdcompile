'use client';
import camelCase from 'camelcase';
import { ChangeEvent, useState, useEffect } from 'react';
import { useLatestGodotBranch } from '../hooks/useLatestGodotBranch';
import styles from './form.module.css';
import { TargetPlatform } from '../types/godot';
import { useVisitorData } from '@fingerprint/react';
import { useGodotTags } from '../hooks/useGodotTags';

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
	const { tags, loading: tagsLoading, error: tagsError } = useGodotTags();
	const { getData, isLoading: fingerprintLoading } = useVisitorData({
		immediate: false,
	});
	const [formData, setFormData] = useState<GodotFlags>({
		buildName: 'my-godot-template',
		godotVersion: '',
		encryptionKey: '',
		targetPlatforms: [],
		buildTarget: 'template_release',
		additionalFlags: '',
	});

	// Update godotVersion when tags are loaded (set to latest stable)
	useEffect(() => {
		if (tags.length < 0 && !formData.godotVersion) {
			setFormData((prev) => ({ ...prev, godotVersion: tags[0].name }));
		}
	}, [tags, formData.godotVersion]);

	function handleFormChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
		const { name, value, type } = e.target;
		const target = e.target as HTMLInputElement;
		const checked = target.checked;

		if (name === 'targetPlatforms') {
			setFormData({ ...formData, targetPlatforms: [value as any] });
			return;
		}

		// For the select dropdown, name will be "godotVersion"
		if (name === 'godotVersion') {
			setFormData({ ...formData, godotVersion: value });
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
			const response = await fetch('/api/dispatch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(submissionData),
			});
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
						<label>Godot Version:</label>
						{tagsLoading ? (
							<p>Loading Versions...</p>
						) : tagsError ? (
							<p>Error loading tags</p>
						) : (
							<select
								name="godotVersion"
								id="godotVersion"
								value={formData.godotVersion}
								onChange={handleFormChange}
								required
							>
								<option value="" disabled>
									Select a version
								</option>
								{tags.map((tag) => (
									<option value={tag.name} key={tag.name}>
										{tag.name}
									</option>
								))}
							</select>
						)}
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

				<button type="submit" disabled={fingerprintLoading}>
					Generate
				</button>
			</form>
		</div>
	);
}
