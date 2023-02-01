import styles from './storyNode.module.css';

export default function StoryNode({storyNode}) {
    return <div className={styles.storyNode}>
        <h1>{storyNode.title}</h1>
        <p>{storyNode.story}</p>
    </div>;
}