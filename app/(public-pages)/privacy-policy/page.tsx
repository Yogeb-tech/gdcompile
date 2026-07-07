export default function PrivacyPage() {
	return (
		<main className="container">
			<article>
				<h1>Privacy</h1>

				<p>
					This project is <a href="https://github.com/Yogeb-tech/gdcompile">open source</a>. No
					personal data is collected or stored.
				</p>

				<p>
					A session cookie is used only to remember your builds. It contains a random ID not linked
					to you.
				</p>

				<p>
					<small>Last updated: {new Date().toLocaleDateString()}</small>
				</p>
			</article>
		</main>
	);
}
