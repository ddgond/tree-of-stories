import Link from "next/link";
import styles from "./storyNodeBreadcrumbs.module.css";

export default function StoryNodeBreadcrumbs({storyNode}) {
    return <div className={`${styles.breadcrumbs} sans-serif`}>
        {storyNode.history.map((context, index) => {
            const href = index === 0 ? '/' : `/storyNode/${context.id}`;
            return <Link className={styles.breadcrumb} href={href} key={index}>
                {context.title}
            </Link>
        })}
    </div>
}