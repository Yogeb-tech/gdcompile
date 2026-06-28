'use client';

import styles from './page.module.css';

function HomePage() {
	return (
		<main className="container">
			<article className={styles.hero}>
				<h1>GDCompile</h1>
				<p>Custom Godot export templates, compiled on demand</p>
				<p className={styles.heroSubtitle}>Builds take ~30–120 minutes</p>
				<h3>Features</h3>
				<div className={styles.featuresGrid}>
					<div>Encryption</div>
					<div>Mono/C# support</div>
					<div>Multi-platform</div>
					<div>Custom SCons flags</div>
				</div>

				<a href="/create" role="button" style={{ width: '100%' }}>
					Start Building →
				</a>

				<div className={styles.credits}>
					<small>
						Built off of{' '}
						<a
							href="https://github.com/appsinacup/action_godot_builder"
							target="_blank"
							rel="noopener noreferrer"
						>
							action_godot_builder
						</a>{' '}
						by appsinacup
					</small>
					<small>
						Godot Icon by Zayronxio on{' '}
						<a
							href="https://icon-icons.com/authors/601-zayronxio"
							target="_blank"
							rel="noopener noreferrer"
						>
							Icon-Icons.com
						</a>
					</small>
				</div>
			</article>
		</main>
	);
}

export default function Home() {
	return <HomePage />;
}
