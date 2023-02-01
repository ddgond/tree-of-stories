import styles from './storyNode.module.css';

export default function StoryNode({storyNode}) {
    return <div className={styles.storyNode}>
        {
            storyNode.history.length > 1 &&
            <h2 className={styles.subtitle}>{storyNode.storyTitle} - Part {storyNode.history.length}</h2>
        }
        <h1>{storyNode.title}</h1>
        <p>{storyNode.story}</p>
    </div>;
}