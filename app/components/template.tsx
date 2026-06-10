'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVisitorData } from '@fingerprint/react';
import styles from './template.module.css';

// TODO: Pass down fingerprint via context

interface TemplateProps {
	children: React.ReactNode;
	requireFingerprint?: boolean;
}

export default function Template({ children, requireFingerprint = false }: TemplateProps) {
	const router = useRouter();
	const { data, isLoading } = useVisitorData({ immediate: true });

	// Handle adblock redirect
	useEffect(() => {
		if (requireFingerprint && !isLoading && !data) {
			router.push('/adblock-detected');
		}
	}, [requireFingerprint, isLoading, data, router]);

	// Loading state
	if (requireFingerprint && isLoading) {
		return <div className={styles.container}>Loading...</div>;
	}

	// Don't render if fingerprint required but missing
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
