import {storyRoot} from "../../../lib/main.js";
import {generationQueue} from "../../../lib/main.js";
import Logger from "../../../lib/Logger";
import {requestToString} from "../../../lib/utilities";
import Statistics from "../../../lib/Statistics";

function createStoryNode(req, res) {
    const { prompt, genre, password } = req.body;
    if (!prompt) {
        Statistics.malformedRequests.increment();
        Logger.log(requestToString(req), 'Missing prompt');
        res.status(400).send();
        return;
    }
    if (password !== process.env.ADMIN_PASSWORD) {
        Statistics.unauthorizedRequests.increment();
        Logger.log(requestToString(req), 'Invalid password');
        res.status(403).send();
        return;
    }
    Statistics.generationRequests.increment();
    const startTime = Date.now();
    storyRoot.addPrompt(prompt);
    generationQueue.push(`${storyRoot.id} - ${storyRoot.prompts.length - 1}`);
    storyRoot.generateChildFromSelection(storyRoot.prompts.length - 1, genre).then(() => {
        Logger.log(`Created story "${prompt}"`, 'Created story');
        res.status(200).send();
    }).catch(error => {
        Statistics.failedResponses.increment();
        Logger.error(error, 'Error generating story');
        res.status(500).send();
    }).finally(() => {
        generationQueue.splice(generationQueue.indexOf(`${id} - ${index}`), 1);
        if (Date.now() - startTime > 60000) {
            Statistics.slowGenerationRequests.increment();
            Logger.log(`Story took ${Date.now() - startTime}ms to generate`, '>60000ms story generation');
        }
    });
}

export default function handler(req, res) {
    if (req.method !== "POST") {
        Statistics.invalidMethodRequests.increment();
        Logger.log(requestToString(req), 'Invalid request method');
        res.status(405).send();
    } else {
        createStoryNode(req, res);
    }
}