'use client';
import Form from './components/form';
import { useVisitorContext } from './components/fingerprintProvider';

function HomePage() {
	const visitorContext = useVisitorContext();
	return (
		<div>
			<Form fingerprint={visitorContext.fingerprintData} />
		</div>
	);
}

export default function Home() {
	return <HomePage />;
}
