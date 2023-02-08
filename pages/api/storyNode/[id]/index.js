// Ensure storyRoot is loaded before any requests are processed
import {storyRoot} from "../../../../lib/main";
import StoryNode from "../../../../lib/StoryNode.js";
import Logger from "../../../../lib/Logger";
import {requestToString} from "../../../../lib/utilities";
import Statistics from "../../../../lib/Statistics";

function getById(req, res) {
    const { id } = req.query;
    const storyNode = StoryNode.findStory(id);
    if (!storyNode) {
        Statistics.malformedRequests.increment();
        Logger.log(requestToString(req), 'Nonexistent story node');
        res.status(404).send();
        return;
    }
    Statistics.storyNodeRequests.increment();
    res.status(200).json(storyNode.toMetadata());
}

function deleteById(req, res) {
    const { id } = req.query;
    const { password } = req.body;
    if (!id) {
        Statistics.malformedRequests.increment();
        Logger.log(requestToString(req), 'Missing id');
        res.status(400).send();
        return;
    }
    if (password !== process.env.ADMIN_PASSWORD) {
        Statistics.unauthorizedRequests.increment();
        Logger.log(requestToString(req), 'Invalid password');
        res.status(403).send();
        return;
    }
    const storyNode = StoryNode.findStory(id);
    if (!storyNode) {
        Statistics.malformedRequests.increment();
        Logger.log(requestToString(req), 'Nonexistent story node');
        res.status(404).send();
        return;
    }
    if (storyNode === storyRoot) {
        Statistics.unauthorizedRequests.increment();
        Logger.log(requestToString(req), 'Attempted deletion of story root');
        res.status(403).send();
        return;
    }
    Logger.log(`Deleted story node "${storyNode.title}"`, 'Deleted story node');
    storyNode.delete();
    res.status(200).send();
}

export default function handler(req, res) {
    if (req.method === "GET") {
        getById(req, res);
    } else if (req.method === "DELETE") {
        deleteById(req, res);
    } else {
        Statistics.invalidMethodRequests.increment();
        Logger.log(requestToString(req), 'Invalid request method');
        res.status(405).send();
    }
}
