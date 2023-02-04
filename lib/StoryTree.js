// Check if the story tree json file exists
import fs from "fs";
import StoryNode from "./StoryNode.js";

function exists() {
  return fs.existsSync('storyTree.json');
}

// Create a function that saves the story tree to a json file on the server
function save(storyTree) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(storyTree.toJson());
    fs.writeFile('storyTree.json', jsonData, {}, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Create a function that loads the story tree from a json file on the server, creating a new one if it does not exist
function load() {
  if (!exists()) {
    console.log('Story tree does not exist. Creating a new one.');
    const defaultInitialStoryNode = new StoryNode(
      'Welcome to the Tree of Stories, an AI-powered infinitely-branching storyteller. Please select a story to begin.',
      'The Tree of Stories',
      []);
    defaultInitialStoryNode.storySummary = defaultInitialStoryNode.story;
    return defaultInitialStoryNode;
  }
  const data = fs.readFileSync('storyTree.json', 'utf8');
  console.log('Story tree loaded successfully.');
  const jsonData = JSON.parse(data);
  return StoryNode.fromJson(jsonData);
}

export default { exists, save, load };