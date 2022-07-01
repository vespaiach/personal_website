import Head from 'next/head';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useCallback, useEffect, useRef } from 'react';

import { ThemeContext } from '@lib/useTheme';
import BulbIcon from './BulbIcon';
import CloseIcon from './CloseIcon';
import GithubIcon from './GithubIcon';
import HamburgerIcon from './HamburgerIcon';
import LinkedInIcon from './LinkedInIcon';
import MailIcon from './MailIcon';
import { cx } from '@lib/utils';

function toogleThemeMode() {
    let mode = 'light';
    if (document.documentElement.classList.contains('light')) {
        mode = 'dark';
    }

    document.documentElement.setAttribute('class', cx('scroll-smooth', mode));
    Cookies.set('theme-mode', mode, { expires: 365 });
}

export default function Layout({ children, report }: { report?: string; children: React.ReactNode }) {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const handleOpen = useCallback(() => {
        if (!menuRef.current) return;

        menuRef.current.classList.add('translate-x-0');
        menuRef.current.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden';
    }, [menuRef.current]);
    const handleClose = useCallback(() => {
        if (!menuRef.current) return;

        menuRef.current.classList.add('translate-x-full');
        menuRef.current.classList.remove('translate-x-0');
        document.body.style.overflow = 'unset';
    }, [menuRef.current]);

    useEffect(() => {
        document.body.style.overflow = 'unset';
    }, []);

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="author" content="Vespaiach - I'm a web developer." />
            </Head>

            <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0">
                <div className="flex h-screen flex-col justify-between">
                    <header className="flex items-center justify-between py-10">
                        <div>
                            <a aria-label="Vespaiach's Blog" href="/" title="Vespaiach's Blog">
                                <div className="flex items-center justify-between">
                                    <div className="sm:h-8 md:h-6 text-2xl text-orange-600 font-semibold sm:block">
                                        Nguyen's Blog
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div className="flex items-center text-base leading-5">
                            <div className="hidden sm:block">
                                <Link href="/posts">
                                    <a className="p-1 font-medium text-gray-500 dark:text-gray-100 sm:p-4 hover:text-cyan-600">
                                        Posts
                                    </a>
                                </Link>
                                <Link href="/tags">
                                    <a className="p-1 font-medium text-gray-500 dark:text-gray-100 sm:p-4 hover:text-cyan-600">
                                        Tags
                                    </a>
                                </Link>
                                <Link href="/about">
                                    <a className="p-1 font-medium text-gray-500 dark:text-gray-100 sm:p-4 hover:text-cyan-600">
                                        About
                                    </a>
                                </Link>
                            </div>
                            <button
                                onClick={toogleThemeMode}
                                aria-label="Toggle Dark Mode"
                                type="button"
                                className="ml-1 mr-1 h-8 w-8 rounded p-1 sm:ml-4 text-gray-500 hover:text-cyan-600">
                                <BulbIcon />
                            </button>
                            <div className="sm:hidden">
                                <button
                                    onClick={handleOpen}
                                    type="button"
                                    className="ml-1 mr-1 h-8 w-8 rounded p-1 sm:ml-4 text-gray-500 hover:text-cyan-600"
                                    aria-label="Open Menu">
                                    <HamburgerIcon />
                                </button>
                                <div
                                    ref={menuRef}
                                    className="flex flex-col fixed top-0 left-0 z-10 h-full w-full transform bg-[#fafafa] opacity-95 duration-300 ease-in-out dark:bg-gray-800 translate-x-full">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleClose}
                                            type="button"
                                            className="mr-5 mt-11 h-8 w-8 rounded text-gray-800"
                                            aria-label="Close menu">
                                            <CloseIcon />
                                        </button>
                                    </div>
                                    <nav className="mt-8">
                                        <div className="px-12 py-4">
                                            <Link href="/posts">
                                                <a className="text-2xl font-bold tracking-widest text-gray-800 dark:text-gray-100">
                                                    Posts
                                                </a>
                                            </Link>
                                        </div>
                                        <div className="px-12 py-4">
                                            <Link href="/tags">
                                                <a className="text-2xl font-bold tracking-widest text-gray-800 dark:text-gray-100">
                                                    Tags
                                                </a>
                                            </Link>
                                        </div>
                                        <div className="px-12 py-4">
                                            <Link href="/about">
                                                <a className="text-2xl font-bold tracking-widest text-gray-800 dark:text-gray-100">
                                                    About
                                                </a>
                                            </Link>
                                        </div>
                                    </nav>
                                    <div className="flex-1 flex justify-center items-end">
                                        <span className="mb-3 text-orange-600 font-bold text-xl">
                                            Nguyen's Blog
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                    {children}
                    <footer>
                        <div className="mt-16 flex flex-col">
                            <div className="mb-3 flex space-x-4">
                                <a
                                    className="text-sm text-gray-500 transition hover:text-gray-600"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="mailto:nta.toan@gmail.com">
                                    <span className="sr-only">mail</span>
                                    <MailIcon />
                                </a>
                                <a
                                    className="text-sm text-gray-500 transition hover:text-gray-600"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://github.com/vespaiach">
                                    <span className="sr-only">github</span>
                                    <GithubIcon />
                                </a>
                                <a
                                    className="text-sm text-gray-500 transition hover:text-gray-600"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://www.linkedin.com/in/trinh-nguyen-0a701526/">
                                    <span className="sr-only">linkedin</span>
                                    <LinkedInIcon />
                                </a>
                            </div>
                            <div className="mb-8 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                <div>Vespaiach</div>
                                <div> • </div>
                                <div>© 2022</div>
                                <div> • </div>
                                <a href="/" title="Vespaiach's blog">
                                    Nguyen's Blog
                                </a>
                                {report && (
                                    <>
                                        <div> • </div>
                                        <a href={report} target="_blank" className="text-orange-600">
                                            Report
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
