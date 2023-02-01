import {storyRoot} from "../../../lib/main.js";

function createStoryNode(req, res) {
    const { prompt, password } = req.body;
    if (!prompt) {
        res.status(400).send();
        return;
    }
    if (password !== process.env.ADMIN_PASSWORD) {
        res.status(403).send();
        return;
    }
    storyRoot.addPrompt(prompt);
    res.status(200).send();
}

export default function handler(req, res) {
    if (req.method !== "POST") {
        res.status(405).send();
    } else {
        createStoryNode(req, res);
    }
}