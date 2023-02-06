// Check if the story tree json file exists
import fs from "fs";
import StoryNode from "./StoryNode.js";
import Logger from "./Logger";

function exists() {
  return fs.existsSync('storyTree.json');
}

// Create a function that saves the story tree to a json file on the server
function save(storyTree) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(storyTree.toJson());
    fs.writeFile('storyTree.json', jsonData, {}, (err) => {
      if (err) {
        reject(err);
      } else {
        if (Date.now() - startTime > 1000) {
          Logger.log(`Saved story tree in ${Date.now() - startTime}ms`, '>1000ms');
        }
        resolve();
      }
    });
  });
}

// Create a function that loads the story tree from a json file on the server, creating a new one if it does not exist
function load() {
  if (!exists()) {
    Logger.log('Story tree does not exist. Creating a new one.', 'Story tree file missing');
    const defaultInitialStoryNode = new StoryNode(
      'Welcome to the Tree of Stories, an AI-powered infinitely-branching storyteller. Please select a story to begin.',
      'The Tree of Stories',
      []);
    defaultInitialStoryNode.storySummary = defaultInitialStoryNode.story;
    return defaultInitialStoryNode;
  }
  const startTime = Date.now();
  const data = fs.readFileSync('storyTree.json', 'utf8');
  const jsonData = JSON.parse(data);
  const result = StoryNode.fromJson(jsonData);
  if (Date.now() - startTime > 1000) {
    Logger.log(`Loaded story tree in ${Date.now() - startTime}ms`, '>1000ms');
  }
  return result;
}

export default { exists, save, load };