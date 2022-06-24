import 'tailwindcss/tailwind.css';
import '@styles/prism.css';

import { AppProps } from 'next/app';
import { ThemeContextProvider } from '@lib/useTheme';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ThemeContextProvider>
            <Component {...pageProps} />
        </ThemeContextProvider>
    );
}
