import {storyRoot} from "../../lib/main.js";

export default function getStoryRoot(req, res) {
    res.status(200).json(storyRoot.toMetadata());
}