import Link from "next/link";
import {FiArrowUp} from "react-icons/fi";
import styles from "./storyNodeBreadcrumbs.module.css";

function joinArray(array, separator) {
    return array.reduce((acc, item) => {
        if (acc.length === 0) {
            return [item];
        }
        return [...acc, separator, item];
    }, []);
}

export default function StoryNodeBreadcrumbs({storyNode}) {
    return <div className={`${styles.breadcrumbs} sans-serif`}>
        {storyNode.history.map((context, index) => {
            const href = index === 0 ? '/' : `/storyNode/${context.id}`;
            return <Link className={styles.breadcrumb} href={href} key={index}>
                {index !== 0 && <><span className={styles.subtitle}>Part {index}</span> </>}{context.title}
            </Link>
        }).reverse()}
    </div>
}