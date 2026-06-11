'use client';
import React from 'react';
import { useVisitorData } from '@fingerprint/react';
import styles from './template.module.css';

// TODO: Pass down fingerprint via context

interface TemplateProps {
	children: React.ReactNode;
	requireFingerprint?: boolean;
}

export default function Template({ children, requireFingerprint = false }: TemplateProps) {
	const { data, isLoading, error } = useVisitorData({ immediate: true });

	// Derived values – no state, no useEffect
	const adblockDetected = requireFingerprint && !isLoading && (!data || error);
	const isLoadingFingerprint = requireFingerprint && isLoading;

	// Loading state
	if (isLoadingFingerprint) {
		return <div className={styles.container}>Loading...</div>;
	}

	// Adblock detected (derived)
	if (adblockDetected) {
		return (
			<div className={styles.container}>
				<header className={styles.header}>...</header>
				<main>
					<h1>Adblocker Detected</h1>
					<p>Please disable your adblocker to use GDCompile.</p>
				</main>
				<footer>...</footer>
			</div>
		);
	}

	// If fingerprint required but missing (should be covered above, but fallback)
	if (requireFingerprint && !data) {
		return null;
	}

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<nav className={styles.nav}>
					<ul>
						<li>
							<strong className={styles.brand}>GDCompile</strong>
						</li>
						<li>
							<a href="./">Request Build</a>
						</li>
						<li>
							<a href="/view">Builds</a>
						</li>
					</ul>

					<ul>
						<li>
							<button>GitHub</button>
						</li>
						<li>
							<button>Ko-fi</button>
						</li>
						<li>
							<button>Theme</button>
						</li>
					</ul>
				</nav>
			</header>
			<main className={styles.content}>
				{/* HACK: Pass fingerprint to children if needed */}
				{children}
			</main>
			<footer>
				<p className={styles.footer}>2026 My Website. MIT License.</p>
			</footer>
		</div>
	);
}
