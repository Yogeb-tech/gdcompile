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
					<div className={styles.left}>
						<div className={styles.brand}>GDCompile</div>
						<div className={styles.links}>
							<a className={styles.link} href="./">
								Request Build
							</a>
							<a className={styles.link} href="view">
								Builds
							</a>
						</div>
					</div>

					<div className={styles.right}>
						<button>Github</button>
						<button>Kofi</button>
						<button>Theme</button>
					</div>
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
