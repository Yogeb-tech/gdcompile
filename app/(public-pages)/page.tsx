'use client';

import Form from '../(protected-pages)/create/page';

function HomePage() {
	return (
		<main className="container">
			<article style={{ maxWidth: '600px', margin: '1rem auto', textAlign: 'center' }}>
				<h1>GDCompile</h1>
				<p>Custom Godot export templates, compiled on demand</p>
				<p style={{ color: 'var(--muted-color)' }}>Builds take ~30–120 minutes</p>
				<h3>Features</h3>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '0.5rem',
						margin: '1.5rem 0',
					}}
				>
					<div>Encryption</div>
					<div>Mono/C# support</div>
					<div>Multi-platform</div>
					<div>Custom SCons flags</div>
				</div>

				<a href="/create" role="button" style={{ width: '100%' }}>
					Start Building →
				</a>
			</article>
		</main>
	);
}

export default function Home() {
	return <HomePage />;
}
