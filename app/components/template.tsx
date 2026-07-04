'use client';
import React from 'react';
import styles from './template.module.css';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { SiGithub, SiKofi } from 'react-icons/si';
import { useTheme } from '../hooks/useTheme';
import { useVisitorContext } from './fingerprintProvider';
import Link from 'next/link';

interface TemplateProps {
	children: React.ReactNode;
	requireFingerprint?: boolean;
}

export default function Template({ children, requireFingerprint = false }: TemplateProps) {
	const { fingerprintData, isLoading, error } = useVisitorContext();

	const { theme, toggleTheme } = useTheme();

	// Derived values – no state, no useEffect
	const adblockDetected = requireFingerprint && !isLoading && (!fingerprintData || error);
	const isLoadingFingerprint = requireFingerprint && isLoading;

	// Loading state
	if (isLoadingFingerprint) {
		return <div className={styles.container}>Loading...</div>;
	}

	// Adblock detected (derived)
	if (adblockDetected) {
		return (
			<div className={styles.adblock_container}>
				<main className={styles.adblock_card}>
					<h2>Unable to Continue</h2>
					<p>
						This website is having trouble verifying your browser.
						<br />
						Please disable any adblockers and try again.
					</p>
					<p className={styles.secondary_text}>
						<a href="/privacy-policy">Privacy Policy</a>
					</p>
					<button onClick={() => window.location.reload()} className={styles.refresh_button}>
						Refresh
					</button>
				</main>
			</div>
		);
	}

	// If fingerprint required but missing (should be covered above, but fallback)
	if (requireFingerprint && !fingerprintData) {
		return null;
	}

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<nav className={styles.nav}>
					<ul>
						<li>
							<strong className={styles.brand}>
								<Link href="/" className="contrast">
									GDCompile
								</Link>
							</strong>
						</li>
						<li>
							<Link href="/create">Request Build</Link>
						</li>
						<li>
							<Link href="/view">Builds</Link>
						</li>
						<li>
							<Link href="/privacy-policy" className="">
								Privacy Policy
							</Link>
						</li>
					</ul>

					<ul>
						<li>
							<a
								href="https://github.com/Yogeb-tech/gdcompile"
								aria-label="GitHub"
								className="contrast"
							>
								<SiGithub size={24} />
							</a>
						</li>
						<li>
							<a href="https://ko-fi.com/yogeb" aria-label="Ko-fi" className="contrast">
								<SiKofi size={28} />
							</a>
						</li>
						<li>
							<a className="contrast" onClick={toggleTheme}>
								{theme === 'light' ? <IconMoon size={24} /> : <IconSun />}
							</a>
						</li>
					</ul>
				</nav>
			</header>
			<main className={styles.content}>{children}</main>
			<footer className={styles.footer}>
				<div>
					<p>
						2026{' '}
						<a className="contrast" href="https://github.com/Yogeb-tech">
							Yogeb-tech
						</a>
						. MIT License.
					</p>
				</div>
			</footer>
		</div>
	);
}
