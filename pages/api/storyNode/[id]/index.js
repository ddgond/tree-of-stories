// Ensure storyRoot is loaded before any requests are processed
import {storyRoot} from "../../../../lib/main";
import StoryNode from "../../../../lib/StoryNode.js";

function getById(req, res) {
    const { id } = req.query;
    const storyNode = StoryNode.findStory(id);
    if (!storyNode) {
        res.status(404).send();
        return;
    }
    res.status(200).json(storyNode.toMetadata());
}

function deleteById(req, res) {
    const { id } = req.query;
    const { password } = req.body;
    if (!id) {
        res.status(400).send();
        return;
    }
    if (password !== process.env.ADMIN_PASSWORD) {
        res.status(403).send();
        return;
    }
    const storyNode = StoryNode.findStory(id);
    if (!storyNode) {
        res.status(404).send();
        return;
    }
    storyNode.delete();
    res.status(200).send();
}

export default function handler(req, res) {
    if (req.method === "GET") {
        getById(req, res);
    } else if (req.method === "DELETE") {
        deleteById(req, res);
    } else {
        res.status(405).send();
    }
}