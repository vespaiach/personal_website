import Link from 'next/link';

import Head from '@components/Head';

export default function Custom404() {
    return (
        <>
            <Head title="Page not found - Nguyen's Blog" />
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-row items-center">
                    <h3 className="mr-5 font-bold text-2xl">404</h3>
                    <div className="border-l pl-5">
                        <p>This page could not be found</p>
                        <Link href="/posts">
                            <a title="Go to home page" className="text-orange-600">
                                Nguyen's Blog
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
