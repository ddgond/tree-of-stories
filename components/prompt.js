import Link from "next/link";
import {postSubmit} from "../lib/browserUtilities.js";
import {router} from "next/router";
import {useState} from "react";
import {FiArrowUp, FiType, FiBookOpen} from "react-icons/fi";
import styles from "./prompt.module.css";

function Tooltip({children}) {
    return <div className={styles.tooltip}>{children}</div>
}

function PromptContainer({children}) {
    return <div className={styles.promptContainer}>
        {children}
    </div>
}

export default function Prompt({parent, index}) {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(false);
    const prompt = parent.prompts[index];
    const node = parent.children[index];
    const generate = (event) => {
        event.preventDefault();
        setGenerating(true);
        if (!node) {
            postSubmit(`/api/storyNode/${parent.id}/${index}`, {}).then(res => {
                if (res.ok) {
                    res.json().then(storyNode => {
                        router.push(`/storyNode/${storyNode.id}`);
                    })
                } else {
                    setGenerating(false);
                    setError("failed to generate story node");
                }
            });
        }
    }

    if (node) {
        return <Link href={`/storyNode/${node.id}`} className={styles.link}>
            <PromptContainer>
                <div className={styles.score}>
                    <FiArrowUp/>{node.totalChildren+1}
                </div>
                <div className={styles.promptText}>{prompt}</div>
                <div className={styles.metadata}>
                    <div className={styles.metadatum} title="Total Word Count"><FiType/>{node.totalWordCount}</div>
                    <div className={`${styles.metadatum} ${styles.tooltipParent}`} title="Total Children"><FiBookOpen/>{node.totalChildren+1}</div>
                </div>
            </PromptContainer>
        </Link>
    } else {
        if (generating) {
            return <a href="#" className={styles.link}>
                <PromptContainer>
                    <div className={styles.score}>
                        <FiArrowUp/>0
                    </div>
                    <div className={styles.promptText}>Generating...</div>
                    <div className={styles.metadata}>
                        <div className={styles.metadatum}><FiType/>???</div>
                        <div className={`${styles.metadatum}`}><FiBookOpen/>???</div>
                    </div>
                </PromptContainer>
            </a>;
        }
        return <a href="#" className={styles.link} onClick={generate}>
            <PromptContainer>
                <div className={styles.score}>
                    <FiArrowUp/>0
                </div>
                <div className={styles.promptText}>{prompt}</div>
                <div className={styles.metadata}>
                    <div className={styles.metadatum}><FiType/>???</div>
                    <div className={`${styles.metadatum}`}><FiBookOpen/>???</div>
                </div>
            </PromptContainer>
        </a>;
    }
}