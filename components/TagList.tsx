import { cx } from '@lib/utils';
import Link from 'next/link';

export default function TagList({ tags, selected }: { selected?: string; tags: TagData[] }) {
    return (
        <div className="flex flex-wrap">
            {tags.map((t, i) => (
                <div
                    key={i}
                    className={cx(
                        'mt-2 mb-2 mr-5',
                        selected && t.name === selected && 'border-b-2 border-orange-600',
                    )}>
                    <Link href={`/tags/${t.name}`}>
                        <a className="text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                            {t.name} ({t.count})
                        </a>
                    </Link>
                </div>
            ))}
        </div>
    );
}
