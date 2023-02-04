import {storyRoot} from "../../../lib/main.js";
import {generationQueue} from "../../../lib/main.js";

function createStoryNode(req, res) {
    const { prompt, genre, password } = req.body;
    if (!prompt) {
        res.status(400).send();
        return;
    }
    if (password !== process.env.ADMIN_PASSWORD) {
        res.status(403).send();
        return;
    }
    storyRoot.addPrompt(prompt);
    generationQueue.push(`${storyRoot.id} - ${storyRoot.prompts.length - 1}`);
    storyRoot.generateChildFromSelection(storyRoot.prompts.length - 1, genre).then(() => {
        res.status(200).send();
    }).catch(error => {
        console.error(error);
        res.status(500).send();
    }).finally(() => {
        generationQueue.splice(generationQueue.indexOf(`${id} - ${index}`), 1);
    });
}

export default function handler(req, res) {
    if (req.method !== "POST") {
        res.status(405).send();
    } else {
        createStoryNode(req, res);
    }
}