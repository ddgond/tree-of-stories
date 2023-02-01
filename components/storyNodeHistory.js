import {useState} from 'react';
import styles from './storyNodeHistory.module.css';

export default function StoryNodeHistory({storyNode}) {
    const [open, setOpen] = useState(false);
    const history = storyNode.history.slice(1, storyNode.history.length);
    if (history.length === 0) {
        return null;
    }
    if (!open) {
        return <p>
            <span className={`${styles.toggleHistoryButton} sans-serif`} onClick={() => setOpen(true)}>Show History</span>
        </p>;
    }
    return <div className={styles.history}>
        <p>
            <span className={`${styles.toggleHistoryButton} sans-serif`} onClick={() => setOpen(false)}>Hide History</span>
        </p>
        {history.map((storyNode) =>
            <div key={storyNode.id}>
                <h2>{storyNode.title}</h2>
                <p>{storyNode.story}</p>
            </div>
        )}
        <p>
            <span className={`${styles.toggleHistoryButton} sans-serif`} onClick={() => setOpen(false)}>Hide History</span>
        </p>
    </div>;
}