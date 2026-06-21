import { useState } from 'react';

export function useKey() {
	const [key, setKey] = useState<CryptoKey | null>(null);

	const generateAESKey = async () => {
		const k = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
			'encrypt',
			'decrypt',
		]);

		setKey(k as CryptoKey);
		return k as CryptoKey;
	};

	const exportBase64 = async (cryptoKey: CryptoKey) => {
		const raw = await crypto.subtle.exportKey('raw', cryptoKey);
		const bytes = new Uint8Array(raw);
		return Array.from(bytes)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
	};

	return { key, generateAESKey, exportBase64 };
}
