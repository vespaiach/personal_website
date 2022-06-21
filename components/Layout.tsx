import Head from 'next/head';
import BulbIcon from './BulbIcon';
import CloseIcon from './CloseIcon';
import GithubIcon from './GithubIcon';
import HamburgerIcon from './HamburgerIcon';
import LinkedInIcon from './LinkedInIcon';
import MailIcon from './MailIcon';

export default function Layout({ children, report }: { report?: string; children: React.ReactNode }) {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="author" content="Vespaiach - I'm a web developer."></meta>
                <link rel="stylesheet" href="/main.css" />
            </Head>

            <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0">
                <div className="flex h-screen flex-col justify-between">
                    <header className="flex items-center justify-between py-10">
                        <div>
                            <a aria-label="TailwindBlog" href="/">
                                <div className="flex items-center justify-between">
                                    <div className="mr-3"></div>
                                    <div className="hidden h-6 text-2xl font-semibold sm:block">
                                        Vespaiach's Blog
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div className="flex items-center text-base leading-5">
                            <div className="hidden sm:block">
                                <a
                                    className="p-1 font-medium text-gray-900 dark:text-gray-100 sm:p-4"
                                    href="/">
                                    Posts
                                </a>
                                <a
                                    className="p-1 font-medium text-gray-900 dark:text-gray-100 sm:p-4"
                                    href="/tags">
                                    Tags
                                </a>
                                <a
                                    className="p-1 font-medium text-gray-900 dark:text-gray-100 sm:p-4"
                                    href="/about">
                                    About
                                </a>
                            </div>
                            <button
                                aria-label="Toggle Dark Mode"
                                type="button"
                                className="ml-1 mr-1 h-8 w-8 rounded p-1 sm:ml-4">
                                <BulbIcon />
                            </button>
                            <div className="sm:hidden">
                                <button
                                    type="button"
                                    className="ml-1 mr-1 h-8 w-8 rounded py-1"
                                    aria-label="Toggle Menu">
                                    <HamburgerIcon />
                                </button>
                                <div className="fixed top-0 left-0 z-10 h-full w-full transform bg-gray-200 opacity-95 duration-300 ease-in-out dark:bg-gray-800 translate-x-full">
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            className="mr-5 mt-11 h-8 w-8 rounded"
                                            aria-label="Toggle Menu">
                                            <CloseIcon />
                                        </button>
                                    </div>
                                    <nav className="fixed mt-8 h-full">
                                        <div className="px-12 py-4">
                                            <a
                                                className="text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100"
                                                href="/blog">
                                                Posts
                                            </a>
                                        </div>
                                        <div className="px-12 py-4">
                                            <a
                                                className="text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100"
                                                href="/tags">
                                                Tags
                                            </a>
                                        </div>
                                        <div className="px-12 py-4">
                                            <a
                                                className="text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100"
                                                href="/about">
                                                About
                                            </a>
                                        </div>
                                    </nav>
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
                                <a href="/">Vespaiach's Blog</a>
                                {report && (
                                    <>
                                        <div> • </div>
                                        <a href={report} target="_blank">
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
