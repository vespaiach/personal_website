import Link from 'next/link';

export default function Custom404() {
    return (
        <div className="flex h-full w-full items-center justify-center h-[100vh]">
            <div className="flex flex-row items-center">
                <h3 className="mr-5 font-bold text-2xl">404</h3>
                <div className="border-l pl-5">
                    <p>This page could not be found</p>
                    <Link href="/">
                        <a title="Go to home page" className="text-orange-600">
                            Vespaiach's Blog
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
}
