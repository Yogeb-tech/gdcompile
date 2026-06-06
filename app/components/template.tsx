import React from 'react';
import styles from './template.module.css';

interface TemplateProps {
	children: React.ReactNode;
}

// TODO: Add icons  then use this template across codebase
// TODO: Add conditional logic to compliment this template
export default function Template({ children }: TemplateProps) {
	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<nav className={styles.nav}>
					<div className={styles.left}>
						<div className={styles.brand}>GDCompile</div>
						<div className={styles.links}>
							<a className={styles.link} href="#">
								Request Build
							</a>
							<a className={styles.link} href="#">
								Builds
							</a>
						</div>
					</div>

					<div className={styles.right}>
						<a className={styles.link} href="#">
							GitHub
						</a>
						<button>Theme</button>
					</div>
				</nav>
			</header>
			<main>{children}</main>
			<footer>
				<p>&copy; 2026 My Website. MIT License.</p>
			</footer>
		</div>
	);
}
