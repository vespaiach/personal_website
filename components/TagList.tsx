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
        <div className={className} itemScope itemProp="keywords" itemType="https://schema.org/DefinedTerm">
            {tags.map((t) => (
                <Link key={t.name} href={`/tags/${t.name}`}>
                    <a
                        itemProp="url"
                        className={cx(
                            selectedTag && t.name === selectedTag && 'border-b-2 border-orange-600',
                            tagClassName,
                        )}
                        title={t.name}>
                        <span itemProp="name">{t.name}</span>
                        {`${t.count && t.count > 0 ? ` (${t.count})` : ''}`}
                    </a>
                </Link>
            ))}
        </div>
    );
}

// export default function TagList({ tags, selected }: { selected?: string; tags: TagData[] }) {
//     return (
//         <div className="flex flex-wrap">
//             {tags.map((t, i) => (
//                 <div
//                     key={i}
//                     className={cx(
//                         'mt-2 mb-2 mr-5',
//                         selected && t.name === selected && 'border-b-2 border-orange-600',
//                     )}>
//                     <Link href={`/tags/${t.name}`}>
//                         <a className="text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
//                             {t.name} ({t.count})
//                         </a>
//                     </Link>
//                 </div>
//             ))}
//         </div>
//     );
// }
