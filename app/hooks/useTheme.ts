import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const KEY = 'picoPreferredColorScheme';
const ROOT_ATTR = 'data-theme';

const getStored = (): Theme | null => {
	try {
		const v =
			typeof window !== 'undefined' && window.localStorage
				? window.localStorage.getItem(KEY)
				: null;
		return v === 'light' || v === 'dark' ? v : null;
	} catch {
		return null;
	}
};

const applyTheme = (t: Theme) => {
	if (typeof document !== 'undefined') document.documentElement.setAttribute(ROOT_ATTR, t);
};

export function useTheme(defaultTheme: Theme = 'dark') {
	const initial = getStored() ?? defaultTheme;
	const [theme, setThemeState] = useState<Theme>(initial);

	useEffect(() => {
		applyTheme(theme);
		try {
			if (typeof window !== 'undefined' && window.localStorage)
				window.localStorage.setItem(KEY, theme);
		} catch {}
	}, [theme]);

	const setTheme = (t: Theme) => setThemeState(t);

	const toggleTheme = () => setThemeState((t) => (t === 'light' ? 'dark' : 'light'));

	return { theme, setTheme, toggleTheme };
}
