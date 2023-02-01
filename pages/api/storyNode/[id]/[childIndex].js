// Ensure storyRoot is loaded before any requests are processed
import {storyRoot} from "../../../../lib/main";
import StoryNode from "../../../../lib/StoryNode.js";
import {generationQueue} from "../../../../lib/main.js";

function createChild(req, res) {
    const { id, childIndex } = req.query;
    const currentNode = StoryNode.findStory(id);
    const index = parseInt(childIndex);
    const currentChild = currentNode.children[index];
    if (currentChild) {
        res.status(400).send();
        return;
    }
    if (generationQueue.includes(`${id} - ${index}`)) {
        let timeout;
        // Wait for the story node to be generated
        const interval = setInterval(() => {
            if (currentNode.children[index]) {
                clearInterval(interval);
                res.status(200).json(currentNode.children[index].toMetadata());
                if (timeout) {
                    clearTimeout(timeout);
                }
            }
        }, 1000);
        // If the story node is not generated after 60 seconds, return an error
        timeout = setTimeout(() => {
            clearInterval(interval);
            res.status(500).send();
        }, 60000);
        return;
    }
    generationQueue.push(`${id} - ${index}`);
    return currentNode.generateChildFromSelection(index).then(newNode => {
        res.status(200).json(newNode.toMetadata());
    }).catch(err => {
        console.error(err);
        res.status(500).send();
    }).finally(() => {
        generationQueue.splice(generationQueue.indexOf(`${id} - ${index}`), 1);
    });
}

export default function handler(req, res) {
    if (req.method !== "POST") {
        res.status(405).send();
    } else {
        return createChild(req, res);
    }
}