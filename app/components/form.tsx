'use client';
import camelCase from 'camelcase';
import { ChangeEvent, useState, useEffect, useRef } from 'react';
import styles from './form.module.css';
import { TargetPlatform } from '../types/godot';
import { useGodot4Tags } from '../hooks/useGodotTags';
import { useRouter } from 'next/navigation';
import { EMPTY_FINGERPRINT, FingerprintData } from '../types/fingerprint';
import { useKey } from '../hooks/useKey';
import { useVisitorContext } from './fingerprintProvider';
import { StatusCodes } from 'http-status-codes';

export interface SubmissionData {
	fingerprint: FingerprintData;
	buildName: string;
	godotVersion: string;
	encryptionKey: string;
	targetPlatforms: TargetPlatform['name'][];
	buildTarget: 'template_release' | 'template_debug';
	monoEnabled: boolean;
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
	const { fingerprintData: fingerprint } = useVisitorContext();
	const { exportBase64, generateAESKey } = useKey();
	const router = useRouter();
	const { tags, loading: tagsLoading, error: tagsError } = useGodot4Tags();
	const defaultGodotVersion = tags.length > 0 ? tags[0].name : '';
	const [errorMessage, setErrorMessage] = useState<string>('');
	const presets: Record<string, string> = {
		Compress: 'optimize=size lto=full',
		'Compress (No 3D)': 'optimize=size lto=full disable_3d=yes module_godot_physics_3d_enabled=no',
		None: '',
	};

	const [formData, setFormData] = useState<SubmissionData>({
		fingerprint: EMPTY_FINGERPRINT,
		buildName: '',
		godotVersion: defaultGodotVersion,
		encryptionKey: '',
		targetPlatforms: [],
		buildTarget: 'template_release',
		monoEnabled: false,
		additionalFlags: '',
	});

	const [isSubmitting, setIsSumbitting] = useState<boolean>(false);

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
		setIsSumbitting(true);

		try {
			// Combine form with fingerprint
			const submissionData: SubmissionData = {
				...formData,
				fingerprint: fingerprint!,
			};

			console.log('SUBMISSION WITH FINGERPRINT:\n' + JSON.stringify(submissionData, null, 2));

			// Make dispatch api call
			const response = await fetch('/api/workflows', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(submissionData),
			});

			if (!response.ok) {
				if (response.status === StatusCodes.TOO_MANY_REQUESTS) {
					setErrorMessage("You've reached the maximum of 3 builds per user");
					return;
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			console.log('Build submitted successfully:', result);

			await alert('Build submitted successfully!');
			// Redirect to view builds page
			router.push(`/view`);
			setErrorMessage('');
		} catch (error) {
			console.error('Submission failed:', error);
			alert('Failed to submit. Please try again.');
		} finally {
			setIsSumbitting(false);
		}
	}

	return (
		<div>
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
							<p className="error-text">Error loading tags</p>
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
					<div
						style={{
							display: 'flex',
							alignItems: 'baseline',
							gap: 12,
							alignContent: 'space-between',
						}}
					>
						<label htmlFor="encryptionKey">Encryption Key (Optional)</label>

						<a
							onClick={async () => {
								const b64 = await exportBase64(await generateAESKey());
								setFormData((prev) => ({ ...prev, encryptionKey: b64 }));
							}}
							className="secondary"
						>
							Generate Key
						</a>
					</div>
					{/* TODO: Add a copy to clipboard button */}
					<input
						type="text"
						name="encryptionKey"
						id="encryptionKey"
						onChange={handleFormChange}
						value={formData.encryptionKey}
						placeholder="Your encryption key here"
						readOnly
					/>
					<small>
						Leave empty if not using encryption. Make sure you store this somewhere safe.
					</small>
				</div>

				<div className={styles.formGroup}>
					<label htmlFor="buildTarget">Build Target</label>
					<select
						name="buildTarget"
						id="buildTarget"
						onChange={handleFormChange}
						value={formData.buildTarget}
					>
						<option value="template_release">Release</option>
						<option value="template_debug">Editor</option>
					</select>
				</div>

				<div className={styles.formGroup}>
					<label htmlFor="monoEnabled">Mono Enabled? (Use C# Build) (Optional)</label>
					<input
						type="checkbox"
						name="monoEnabled"
						id="monoEnabled"
						onChange={handleFormChange}
						value={formData.buildTarget}
					></input>
				</div>

				<div className={styles.formGroup}>
					<label htmlFor="additionalFlags">
						Additional SCons Flags (Optional) &nbsp;
						<small>
							<a href="https://docs.godotengine.org/en/stable/engine_details/development/compiling/optimizing_for_size.html">
								View more build flags
							</a>
						</small>
					</label>
					<div className={styles.additionalFlags}>
						<input
							type="text"
							name="additionalFlags"
							id="additionalFlags"
							onChange={handleFormChange}
							value={formData.additionalFlags}
						/>
						<select
							name="select"
							aria-label="select"
							defaultValue=""
							onChange={(event) => {
								const value = event.target.value;

								setFormData((prev) => ({
									...prev,
									additionalFlags: presets[value],
								}));
							}}
						>
							<option disabled value="">
								Preset?
							</option>
							<option>Compress</option>
							<option>Compress (No 3D)</option>
							<option>None</option>
						</select>
					</div>
					<small>
						Space-separated key=value flags. Web-specific options like javascript_eval, threads,
						dlink_enabled should also go here.
					</small>
				</div>

				<fieldset className={styles.platformsGrid}>
					<legend>Target Platforms * (select one or more)</legend>
					<input
						type="checkbox"
						name="targetPlatforms"
						required
						className={styles.hiddenRequired}
						checked={formData.targetPlatforms.length > 0}
						onChange={() => {}}
					/>
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
						<small className="error-text">Please select at least one platform</small>
					)}
				</fieldset>

				{errorMessage !== '' && (
					<div className={styles.formData}>
						<div className="error-text">{errorMessage}</div>
					</div>
				)}

				<button type="submit" disabled={isSubmitting || !fingerprint} aria-busy={isSubmitting}>
					{isSubmitting ? 'Generating...' : 'Generate Build'}
				</button>
			</form>
		</div>
	);
}
