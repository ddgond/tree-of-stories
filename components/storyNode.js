import {FiArrowLeft} from "react-icons/fi";
import styles from './storyNode.module.css';
import Link from "next/link";

export default function StoryNode({storyNode}) {
    return <div className={styles.storyNode}>
        {
            storyNode.history.length > 1 &&
          <div className={styles.subtitleBar}><Link className={styles.backArrow} href={`/storyNode/${storyNode.parent.id}`}><FiArrowLeft/></Link><h2 className={styles.subtitle}>{storyNode.storyTitle} - Part {storyNode.history.length}</h2></div>
        }
        <h1>{storyNode.title}</h1>
        <p>{storyNode.story}</p>
    </div>;
}