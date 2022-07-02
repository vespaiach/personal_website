import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { cx } from '@lib/utils';

export default function NavigatingLink({
    children,
    href,
    className,
}: {
    children: React.ReactNode;
    href: string;
    className?: string;
}) {
    const [active, setActive] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setActive(router.asPath.startsWith(href));
    }, [router.asPath, href]);

    const handleClick = (e) => {
        e.preventDefault();
        router.push(href);
    };

    return (
        <a
            href={href}
            onClick={handleClick}
            className={cx(className, active && 'underline decoration-2 underline-offset-2 decoration-orange-600')}>
            {children}
        </a>
    );
}
