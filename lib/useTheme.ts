import { useCallback, useEffect, useState } from 'react';

export default function useTheme() {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        setTheme(theme === 'dark' ? 'dark' : 'light');
    }, []);

    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add(theme);
    }, [theme]);

    const toggle = useCallback(() => void setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

    return { theme, toggle };
}
