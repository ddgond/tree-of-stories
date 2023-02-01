import Link from "next/link";
import {postSubmit} from "../lib/browserUtilities.js";
import {router} from "next/router";
import {useState} from "react";

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
        return <Link href={`/storyNode/${node.id}`}>
            {prompt} ({node.totalWordCount} words, depth: {node.maxDepth} entries)
        </Link>
    } else {
        if (generating) {
            return <a href="#">Generating...</a>;
        }
        return <a href="#" onClick={generate}>{prompt}{error ? ` (${error})` : ` (not yet generated)`}</a>;
    }
}