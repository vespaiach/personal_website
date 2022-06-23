import { createContext, useCallback, useEffect, useState } from 'react';

export const ThemeContext = createContext(() => {});

export function ThemeContextProvider({ children }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        let theme = 'light';
        if (typeof window !== 'undefined') {
            theme = localStorage.getItem('theme');
        }
        setTheme(theme === 'dark' ? 'dark' : 'light');
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add(theme);
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    const toggle = useCallback(() => void setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

    return <ThemeContext.Provider value={toggle}>{children}</ThemeContext.Provider>;
}
