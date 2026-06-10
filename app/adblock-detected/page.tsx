import Template from '../components/template';

export default function AdBlockDetected() {
	return (
		<div>
			<Template>
				<h1>Adblocker Detected</h1>
				<p>Please disable your adblocker to use the request form.</p>
			</Template>
		</div>
	);
}
