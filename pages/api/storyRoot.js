import {storyRoot} from "../../lib/main.js";
import Logger from "../../lib/Logger";
import {requestToString} from "../../lib/utilities";
import Statistics from "../../lib/Statistics";

export default function getStoryRoot(req, res) {
    if (req.method !== "GET") {
        Statistics.invalidMethodRequests.increment();
        Logger.log(requestToString(req), 'Invalid request method');
        res.status(405).send();
    } else {
        Statistics.storyRootRequests.increment();
        Statistics.storyNodeRequests.increment();
        res.status(200).json(storyRoot.toMetadata());
    }
}