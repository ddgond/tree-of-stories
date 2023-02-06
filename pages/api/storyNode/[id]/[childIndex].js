// Ensure storyRoot is loaded before any requests are processed
import {storyRoot} from "../../../../lib/main";
import StoryNode from "../../../../lib/StoryNode.js";
import {generationQueue} from "../../../../lib/main.js";
import Logger from "../../../../lib/Logger";
import {requestToString} from "../../../../lib/utilities";

function createChild(req, res) {
    const { id, childIndex } = req.query;
    const currentNode = StoryNode.findStory(id);
    const index = parseInt(childIndex);
    const currentChild = currentNode.children[index];
    if (currentChild) {
        Logger.log(requestToString(req), 'Child already exists');
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
            Logger.log(requestToString(req), `Child '${id} - ${index}' in generation queue for too long`);
            res.status(500).send();
        }, 60000);
        return;
    }
    const startTime = Date.now();
    generationQueue.push(`${id} - ${index}`);
    const hadSummary = currentNode.summary;
    return currentNode.generateChildFromSelection(index).then(newNode => {
        res.status(200).json(newNode.toMetadata());
    }).catch(err => {
        Logger.error(requestToString(req), 'Error when generating child');
        res.status(500).send();
    }).finally(() => {
        generationQueue.splice(generationQueue.indexOf(`${id} - ${index}`), 1);
        if (hadSummary && Date.now() - startTime > 30000) {
            Logger.log(`Child '${id} - ${index}' took ${Date.now() - startTime}ms to generate`, '>30000ms, despite pre-generated summary');
        }
        if (!hadSummary && Date.now() - startTime > 60000) {
            Logger.log(`Child '${id} - ${index}' took ${Date.now() - startTime}ms to generate`, '>60000ms without pre-generated summary');
        }
    });
}

export default function handler(req, res) {
    if (req.method !== "POST") {
        Logger.log(requestToString(req), 'Invalid request method');
        res.status(405).send();
    } else {
        return createChild(req, res);
    }
}