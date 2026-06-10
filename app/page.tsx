import Form from './components/form';

function HomePage() {
	return (
		<div>
			<Form
				// TODO: Pass down fingerprint via context with template
				fingerprint={{
					visitorId: '',
					eventID: '',
					timestamp: new Date().toISOString(),
				}}
			/>
		</div>
	);
}

export default function Home() {
	return <HomePage />;
}
