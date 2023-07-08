import Link from 'next/link';
import { cx } from '@lib/utils';

export default function TagList({
    tags,
    className,
    tagClassName,
    selectedTag,
}: {
    className?: string;
    tagClassName?: string;
    tags: TagData[];
    selectedTag?: string;
}) {
    return (
        <div className={className}>
            {tags.map((t) => (
                <Link key={t.name} href={`/tags/${t.name}`}
                    itemProp="url"
                    className={cx(
                        selectedTag && t.name === selectedTag && 'border-b-2 border-orange-600',
                        tagClassName,
                    )}
                    title={t.name}>
                    <span>{t.name}</span>
                    {`${t.count && t.count > 0 ? ` (${t.count})` : ''}`}
                </Link>
            ))}
        </div>
    );
}
