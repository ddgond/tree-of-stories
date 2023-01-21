import express from 'express';
import StoryNode from './StoryNode.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT;
const debugging = process.env.DEBUGGING === 'true';

const generationQueue = [];

// Create the initial StoryNode, which acts as a menu for selecting different stories
const initialStoryNode = new StoryNode('Welcome to the AI CYOA storyteller. Please select a story to begin.', 'Home', ['Land of a Thousand Suns', 'Boston Nights', 'The Last Dance', 'Time Keeper', 'Journey to Atlantis', 'Kitchen Mayhem']);
initialStoryNode.storySummary = initialStoryNode.story;

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
    </style>`;
}

function renderSubmissionPage() {
    let response = generatePageCssTag();
    response += `<div class="container">`;
    response += `<form action="${process.env.STORY_SUBMISSION_SLUG}" method="post">
        <input type="text" name="prompt" placeholder="Enter a new story prompt">
        <input type="submit" value="Submit">
    </form>`;
    response += `</div>`;
    return response;
}

// Create a response string with the story and a link for each prompt (if the prompt has a corresponding child), as well as a link to the parent node
// If the prompt does not have a corresponding child, link to a route that will create a story node with a new story and prompts
// Finally, separate from the rest of the contents, link back to the home page
function renderStoryNode(storyNode) {
    let response = generatePageCssTag();
    response += `<div class="container">`;
    response += `<h1>${storyNode.title}</h1>`;
    response += `<p>${storyNode.story}</p>`;
    storyNode.prompts.forEach((prompt, index) => {
        if (storyNode.children[index]) {
            // If the prompt has a corresponding child, link to the child, and display the max depth for that child
            response += `<a href="/story/${storyNode.children[index].id}">${prompt} (depth: ${storyNode.children[index].maxDepth})</a><br>`;
        } else {
            // If the prompt does not have a corresponding child, link to a route that will create a story node with a new story and prompts. Mark the prompt to inform the user that this has not yet been generated
            response += `<a href="/story/${storyNode.id}/${index}">${prompt} (not yet generated)</a><br>`;
        }
    });
    if (storyNode.parent) {
        response += `<a href="/story/${storyNode.parent.id}">Go back</a>`;
    }
    // Only link the home page if this is not the home page
    if (storyNode !== initialStoryNode) {
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
    let response = generatePageCssTag();
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
app.post(`${process.env.STORY_SUBMISSION_SLUG}`, (req, res) => {
    // Add the new prompt to the home page
    initialStoryNode.addPrompt(req.body.prompt);
    // Redirect to the home page
    res.redirect('/');
});

// Create dynamic routes on /story/:id/:index that match the id of a StoryNode and the index of a prompt and generate a
// new StoryNode with a new story and prompts as a child of the StoryNode with the matching id
// Return an error if the StoryNode with the matching id does not exist or if the index is invalid
app.get('/story/:id/:index', (req, res) => {
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
            // Wait for the story node to be generated
            const interval = setInterval(() => {
                if (storyNode.children[index]) {
                    clearInterval(interval);
                    res.send(renderStoryNode(storyNode.children[index]));
                }
            }, 1000);
            // If the story node is not generated after 10 seconds, return an error
            setTimeout(() => {
                clearInterval(interval);
                res.send(render404());
            }, 10000);
            return;
        }
        // Genetate a child for the story node with the matching id and the index of the prompt
        storyNode.generateChildFromSelection(index).then((newStoryNode) => {
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
    res.send(renderStoryNode(initialStoryNode));
});

// Create a 404 route that links back to the home page
app.get('*', (req, res) => {
    res.send(render404());
});

// start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
