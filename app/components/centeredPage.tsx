import styles from './centeredPage.module.css';

interface InfoProps {
	h1Text: string;
	pText: string;
}

export default function CenteredPage({ h1Text, pText }: InfoProps) {
	return (
		<main className={styles.container}>
			<article className={styles.card}>
				<h1>{h1Text}</h1>
				<p>{pText}</p>
			</article>
		</main>
	);
}
