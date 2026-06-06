'use client';
import camelCase from 'camelcase';
import { ChangeEvent, useState, useEffect, useRef } from 'react';
import styles from './form.module.css';
import { TargetPlatform } from '../types/godot';
import { useGodotTags } from '../hooks/useGodotTags';

interface FormProps {
	fingerprint: FingerprintData;
}

export interface SubmissionData {
	fingerprint: {
		visitorId: string | undefined;
		requestId: string;
		timestamp: string;
	};
	buildName: string;
	godotVersion: string;
	encryptionKey: string;
	targetPlatforms: TargetPlatform['name'][];
	buildTarget: 'template_release' | 'template_debug';
	additionalFlags: string;
}

interface GodotFlags {
	buildName: string;
	godotVersion: string;
	encryptionKey: string;
	targetPlatforms: TargetPlatform['name'][];
	LtoMode: 'none' | 'thin' | 'full';
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

export default function Form({ fingerprint }: FormProps) {
	const { tags, loading: tagsLoading, error: tagsError } = useGodotTags();
	const defaultGodotVersion = tags.length > 0 ? tags[0].name : '';

	const [formData, setFormData] = useState<GodotFlags>({
		buildName: '',
		godotVersion: defaultGodotVersion,
		encryptionKey: '',
		targetPlatforms: [],
		buildTarget: 'template_release',
		LtoMode: 'none',
		additionalFlags: '',
	});

	const hasInitialized = useRef(false);

	// Update godotVersion when tags are loaded (set to latest stable)
	useEffect(() => {
		if (tags.length > 0 && !formData.godotVersion && !hasInitialized.current) {
			hasInitialized.current = true;
			setFormData((prev) => ({ ...prev, godotVersion: tags[0].name }));
		}
	}, [tags, formData.godotVersion]);

	function handlePlatformChange(e: ChangeEvent<HTMLInputElement>) {
		const { value, checked } = e.target;
		const platformName = value as TargetPlatform['name'];

		if (checked) {
			// Add platform to array
			setFormData({
				...formData,
				targetPlatforms: [...formData.targetPlatforms, platformName],
			});
		} else {
			// Remove platform from array
			setFormData({
				...formData,
				targetPlatforms: formData.targetPlatforms.filter((p) => p !== platformName),
			});
		}
	}

	function handleFormChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
		const { name, value, type } = e.target;
		const target = e.target as HTMLInputElement;
		const checked = target.checked;

		// Skip handling targetPlatforms here since it has its own handler
		if (name === 'targetPlatforms') {
			return;
		}

		setFormData({
			...formData,
			[name]: type === 'checkbox' ? checked : value,
		});
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		// Validate required fields
		if (!formData.buildName.trim()) {
			alert('Please enter a build name');
			return;
		}

		if (formData.targetPlatforms.length === 0) {
			alert('Please select at least one target platform');
			return;
		}

		try {
			// Combine form with fingerprint
			const submissionData: SubmissionData = {
				...formData,
				fingerprint: fingerprint,
			};

			console.log('SUBMISSION WITH FINGERPRINT:\n' + JSON.stringify(submissionData, null, 2));

			// Make dispatch api call
			const response = await fetch('/api/dispatch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(submissionData),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			console.log('Build submitted successfully:', result);

			// HACK: Optionally redirect or show success message
			alert('Build submitted successfully!');

			// Reset form or redirect as needed
			// router.push(`/builds/${result.jobId}`);
		} catch (error) {
			console.error('Submission failed:', error);
			alert('Failed to submit. Please try again.');
		}
	}

	return (
		<div className={styles.container}>
			<form onSubmit={handleSubmit}>
				<div className={styles.formGroup}>
					<label htmlFor="buildName">Build Name *</label>
					<input
						type="text"
						name="buildName"
						id="buildName"
						onChange={handleFormChange}
						value={formData.buildName}
						placeholder="my-game-build-v1"
						required
					/>
					<small>A unique name to identify this build</small>
				</div>

				<div className={styles.formGroup}>
					<div>
						<label>Godot Version *</label>
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
					<label htmlFor="encryptionKey">Encryption Key (Optional)</label>
					<input
						type="text"
						name="encryptionKey"
						id="encryptionKey"
						onChange={handleFormChange}
						value={formData.encryptionKey}
						placeholder="Your encryption key here"
					/>
					<small>Leave empty if not using encryption</small>
				</div>

				<div className={styles.formGroup}>
					<label htmlFor="buildTarget">Build Target</label>
					<select
						name="buildTarget"
						id="buildTarget"
						onChange={handleFormChange}
						value={formData.buildTarget}
					>
						<option value="template_release">Release (Optimized)</option>
						<option value="template_debug">Debug (With debug symbols)</option>
					</select>
				</div>

				<div className={styles.formGroup}>
					<label htmlFor="LtoMode">LTO Mode</label>
					<select
						name="LtoMode"
						id="LtoMode"
						onChange={handleFormChange}
						value={formData.buildTarget}
					>
						<option value="none">None</option>
						<option value="thin">Thin</option>
						<option value="full">Full</option>
					</select>
				</div>

				<div className={styles.formGroup}>
					<label htmlFor="additionalFlags">Additional SCons Flags</label>
					<input
						type="text"
						name="additionalFlags"
						id="additionalFlags"
						onChange={handleFormChange}
						value={formData.additionalFlags}
						placeholder="optimize=size lto=full disable_3d=yes"
					/>
					<small>
						Space-separated key=value flags. Web-specific options like javascript_eval, threads,
						dlink_enabled should also go here.
					</small>
				</div>

				<fieldset className={styles.platformsGrid}>
					<legend>Target Platforms * (select one or more)</legend>
					<div className={styles.platformsContainer}>
						{platforms.map((platform) => (
							<div key={platform.id} className={styles.platformOption}>
								<input
									type="checkbox"
									id={camelCase(platform.name)}
									name="targetPlatforms"
									value={platform.name}
									onChange={handlePlatformChange}
									checked={formData.targetPlatforms.includes(platform.name)}
								/>
								<label htmlFor={camelCase(platform.name)}>{platform.name}</label>
							</div>
						))}
					</div>
					{formData.targetPlatforms.length === 0 && (
						<small className={styles.errorText}>Please select at least one platform</small>
					)}
				</fieldset>

				<button type="submit">Generate Build</button>
			</form>
		</div>
	);
}
