import { useState } from 'react';

interface useKeyReturn {
	key: CryptoKey | null;
	generateAESKey: () => Promise<CryptoKey>;
}

export function useKey(): useKeyReturn {
	const [key, setKey] = useState<CryptoKey | null>(null);

	const generateAESKey = async () => {
		try {
			const generatedKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
				'encrypt',
				'decrypt',
			]);
			console.log('Generated CryptoKey Object:', generatedKey);
			setKey(generatedKey);
			return generatedKey;
		} catch (error) {
			console.error('Could not generate key: ', error);
			throw error;
		}
	};

	return { key, generateAESKey };
}
