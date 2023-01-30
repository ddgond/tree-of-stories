import express from 'express';
import StoryNode from './StoryNode.js';
import dotenv from 'dotenv';
import StoryTree from './StoryTree.js';
import {hashString} from "./utilities.js";
import slowDown from 'express-slow-down';

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 6 * 15, // allow 6 * 15 requests per 15 minutes, then...
    delayMs: 5000 // begin adding 5000ms of delay per request above 100:
});
const port = process.env.PORT;
const debugging = process.env.DEBUGGING === 'true';

const generationQueue = [];

// Create the initial StoryNode, which acts as a menu for selecting different stories
const storyRoot = StoryTree.load();

// Generate the head element for the page
function generatePageHead(title) {
    return `
        <head>
            <title>${title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="icon" href="data:;base64,iVBORw0KGgo=">
            ${generatePageCssTag()}
        </head>
    `;
}

// Generate the stylesheet for the page
// Center the page's contents in a container
function generatePageCssTag() {
    return `<style>
        body {
            display: flex;
            justify-content: center;
        }
        .container {
            /* do not do this, it is not responsive on mobile: width: 50%; */
            width: 100%;
            max-width: 800px;
            padding: 10px;
        }
        .parentBreadcrumbs {
            font-size: 0.8em;
        }
        .parentStoryContents {
        
        }
        .parentStoryContentsButton {
            cursor: pointer;
            background-color: #eee;
            padding: 5px;
            border-radius: 5px;
        }
        .parentStoryContentsButton:hover {
            background-color: #ddd;
        }
        .parentStoryContentsButton:active {
            background-color: #ccc;
        }
        .hidden {
            display: none;
        }
    </style>`;
}

function renderSubmissionPage() {
    let response = generatePageHead('Story Submission Page');
    response += `<div class="container">`;
    response += `<form action="${process.env.STORY_SUBMISSION_SLUG}" method="post">
        <input type="text" name="prompt" placeholder="Enter a new story prompt">
        <input type="submit" value="Submit">
    </form>`;
    response += `</div>`;
    return response;
}

function renderMessage(message, title="Tree of Stories") {
    let response = generatePageHead(title);
    response += `<div class="container">`;
    response += `<p>${message}</p>`;
    response += `</div>`;
    return response;
}

// Render the story's parents as a breadcrumb recursively
function renderStoryNodeParentsBreadcrumbs(storyNode) {
    let response = '';
    if (storyNode.parent) {
        response += renderStoryNodeParentsBreadcrumbs(storyNode.parent);
        response += `<a href="/story/${storyNode.parent.id}">${storyNode.parent.title}</a> -> `;
    }
    return response;
}

// Render the story's parents' contents recursively
function renderStoryNodeParentsContents(storyNode) {
    let response = '';
    if (storyNode.parent && storyNode.parent !== storyRoot) {
        response += renderStoryNodeParentsContents(storyNode.parent);
        response += `<h2>> ${storyNode.parent.title}</h2>`;
        response += `<p>${storyNode.parent.story}</p>`;
    }
    return response;
}

// Create a response string with the story and a link for each prompt (if the prompt has a corresponding child), as well as a link to the parent node
// If the prompt does not have a corresponding child, link to a route that will create a story node with a new story and prompts
// Finally, separate from the rest of the contents, link back to the home page
function renderStoryNode(storyNode) {
    let response = generatePageHead(`${storyNode.storyTitle} - ${storyNode.title}`);
    response += `<div class="container">`;
    response += `<div class="parentBreadcrumbs">`
    response += renderStoryNodeParentsBreadcrumbs(storyNode);
    response += `</div>`;
    response += `<div class="parentStoryContents hidden">`
    response += `<p><span class="parentStoryContentsButton">Toggle story so far</span></p>`
    response += renderStoryNodeParentsContents(storyNode);
    response += `</div>`;
    if (storyNode !== storyRoot && storyNode.parent !== storyRoot) {
        response += `<p><span class="parentStoryContentsButton">Toggle story so far</span></p>`
    }
    response += `<script>
      document.querySelectorAll('.parentStoryContentsButton').forEach(button => button.addEventListener('click', () => {
        document.querySelector('.parentStoryContents').classList.toggle('hidden');
      }));
    </script>`;
    response += `<h1>> ${storyNode.title}</h1>`;
    response += `<p>${storyNode.story}</p>`;
    response += `<div class="prompts">`;
    storyNode.prompts.forEach((prompt, index) => {
        if (storyNode.children[index]) {
            const node = storyNode.children[index];
            // If the prompt has a corresponding child, link to the child, and display useful metadata
            response += `<a href="/story/${storyNode.children[index].id}">${prompt} (${node.totalWordCount} words, depth: ${node.maxDepth} entries)</a><br>`;
        } else {
            // If the prompt does not have a corresponding child, link to a route that will create a story node with a new story and prompts. Mark the prompt to inform the user that this has not yet been generated
            response += `<a href="/story/${storyNode.id}/${index}">${prompt} (not yet generated)</a><br>`;
        }
    });
    response += `</div>`;
    response += `<script>
      document.querySelectorAll('.prompts a').forEach(link => link.addEventListener('click', e => {
        // Do not override behavior if link is to a story that has already been generated
        if (!link.innerText.includes('not yet generated')) {
          return;
        }
        e.preventDefault();
        link.innerText = 'Generating (please wait)...'
        setTimeout(() => {
          window.location = link.href;
        }, 100);
      }));
    </script>`;
    if (storyNode.parent) {
        response += `<a href="/story/${storyNode.parent.id}">Go back</a>`;
    }
    // Only link the home page if this is not the home page
    if (storyNode !== storyRoot) {
        response += `<br><a href="/">Go home</a>`;
    }
    // Add a debugging section at the bottom that shows the id of the story node and the story summary if it exists
    if (debugging) {
        response += `<br><br><h2>Debugging</h2>`;
        response += `<p>Story ID: ${storyNode.id}</p>`;
        if (storyNode.storySummary) {
            // Replace newlines with <br> tags so that the story summary is displayed correctly
            response += `<p>Story Summary:<br>${storyNode.storySummary.replace(/\n/g, '<br>')}</p>`;
        }
    }
    response += `</div>`;
    return response;
}

function render404() {
    let response = generatePageHead('404: Page not found');
    response += `<div class="container">`;
    response += `<h1>404: Page not found</h1>`;
    response += `<a href="/">Go home</a>`;
    response += `</div>`;
    return response;
}

// Create dynamic routes on /story/:id that match the id of a StoryNode
app.get('/story/:id', (req, res) => {
    const storyNodeId = req.params.id;
    const storyNode = StoryNode.findStory(storyNodeId);
    if (storyNode) {
        res.send(renderStoryNode(storyNode));
    } else {
        res.send(render404());
    }
});

// Create a route that handles GET requests to the submission page
app.get(`${process.env.STORY_SUBMISSION_SLUG}`, (req, res) => {
    res.send(renderSubmissionPage());
});

// Create a route that handles POST requests to generate new stories
// This route is used to add a new prompt to the home page
app.post(`${process.env.STORY_SUBMISSION_SLUG}`, speedLimiter, (req, res) => {
    // Add the new prompt to the home page
    storyRoot.addPrompt(req.body.prompt);
    // Redirect to the home page
    res.redirect('/');
});

// Create a route that deletes a specific story node and all of its children
app.get(`${process.env.STORY_DELETION_SLUG}/:id`, speedLimiter, (req, res) => {
    const storyNodeId = req.params.id;
    const storyNode = StoryNode.findStory(storyNodeId);
    if (storyNode) {
        res.send(renderMessage(`${storyNode.title} deleted. <a href="/">Go home.</a>`, 'Story Deletion Page'));
        storyNode.delete();
    } else {
        res.send(renderMessage(`Story with id '${storyNodeId}' does not exist. <a href="/">Go home.</a>`, 'Story Deletion Page'));
    }
});

// Create dynamic routes on /story/:id/:index that match the id of a StoryNode and the index of a prompt and generate a
// new StoryNode with a new story and prompts as a child of the StoryNode with the matching id
// Return an error if the StoryNode with the matching id does not exist or if the index is invalid
app.get('/story/:id/:index', speedLimiter, (req, res) => {
    const storyNodeId = req.params.id;
    const storyNode = StoryNode.findStory(storyNodeId);
    if (storyNode) {
        const index = parseInt(req.params.index);
        // Do nothing if that child node already exists
        if (storyNode.children[index]) {
            res.send(renderStoryNode(storyNode.children[index]));
            return;
        }
        if (index < 0 || index >= storyNode.prompts.length) {
            res.send(render404());
            return;
        }
        // Check if this story node child is already in the generation queue
        if (generationQueue.includes(`${storyNode.id}-${index}`)) {
            let timeout;
            // Wait for the story node to be generated
            const interval = setInterval(() => {
                if (storyNode.children[index]) {
                    clearInterval(interval);
                    res.send(renderStoryNode(storyNode.children[index]));
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                }
            }, 1000);
            // If the story node is not generated after 60 seconds, return an error
            timeout = setTimeout(() => {
                clearInterval(interval);
                res.send(render404());
            }, 60000);
            return;
        }
        // Generate a child for the story node with the matching id and the index of the prompt
        generationQueue.push(`${storyNode.id}-${index}`);
        storyNode.generateChildFromSelection(index).then((newStoryNode) => {
            generationQueue.splice(generationQueue.indexOf(`${storyNode.id}-${index}`), 1);
            res.send(renderStoryNode(newStoryNode));
        }).catch((error) => {
            console.error(error);
            res.send(render404());
        });
    } else {
        res.send(render404());
    }
});

// Create a route for the home page which renders the initial story node
app.get('/', (req, res) => {
    res.send(renderStoryNode(storyRoot));
});

// Create a 404 route that links back to the home page
app.get('*', (req, res) => {
    res.send(render404());
});

// start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

let lastSavedRootHash = null;
setInterval(() => {
    if (lastSavedRootHash === hashString(JSON.stringify(storyRoot.toJson()))) {
        return;
    }
    lastSavedRootHash = hashString(JSON.stringify(storyRoot.toJson()));
    StoryTree.save(storyRoot).then(() => {
    }).catch((error) => {
        console.error(error);
    });
}, 10000);
