import StoryTree from "./StoryTree.js";
import {hashString} from "./utilities.js";

// Create the initial StoryNode, which acts as a menu for selecting different stories
export const storyRoot = StoryTree.load();

export const generationQueue = [];

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