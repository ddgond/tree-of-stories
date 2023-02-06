import {storyRoot} from "../../lib/main.js";
import Logger from "../../lib/Logger";
import {requestToString} from "../../lib/utilities";

export default function getStoryRoot(req, res) {
    if (req.method !== "GET") {
        Logger.log(requestToString(req), 'Invalid request method');
        res.status(405).send();
    } else {
        res.status(200).json(storyRoot.toMetadata());
    }
}