import 'tailwindcss/tailwind.css';
import '@styles/prism.css';

import { Analytics, AnalyticsBrowser } from '@segment/analytics-next';
import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [segment, setAnalytics] = useState<Analytics | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const [response] = await AnalyticsBrowser.load({ writeKey: `${process.env.NEXT_PUBLIC_SEGMENT_KEY}` });
        setAnalytics(response);
      } catch {}
    })();
  }, []);

  return <Component {...pageProps} segment={segment} />;
}
