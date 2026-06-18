export default function PrivacyPage() {
	return (
		<main className="container">
			<article>
				<h1>Privacy Policy</h1>
				<p>
					I don&apos;t collect any personal data. I use a browser fingerprint (a one-way hash) only
					to prevent abuse and enforce daily build limits.
				</p>
				<p>
					Build requests are sent to GitHub Actions to compile Godot. GitHub only receives your
					build configuration (Godot version, modules, and .profile file) - no personal data is ever
					shared.
				</p>
				<p>
					No cookies are used. No data is sold or monetized. I don&apos;t track you across websites
					or store any identifiable information.
				</p>
				<p>
					<small>Last updated: {new Date().toLocaleDateString()}</small>
				</p>
			</article>
		</main>
	);
}
