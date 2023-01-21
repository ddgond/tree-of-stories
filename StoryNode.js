// A standard Tree node that contains a story, a title, a pointer to its parent node (if it exists),
// and a list of prompts for continuing the story along child nodes. These child nodes are only created once a user
// has selected a prompt to continue the story.
import { generateRandomId } from "./utilities.js";
import AiGeneration from "./AiGeneration.js";

export default class StoryNode {
	constructor(story, title, prompts) {
		this.story = story;
		this.title = title;
		this.id = generateRandomId()
		this.parent = null;
		this.storySummary = null; // This is a summary of the story so far, including details from the parent nodes. This is only generated when the first child is created for efficiency.
		this.prompts = prompts;
		// Instantiate children node list with null values equal to the number of prompts
		this.children = new Array(prompts.length).fill(null);
		this.maxDepth = 1; // The maximum depth of the tree from this node
		StoryNode.storyNodeList.push(this);
	}

	static storyNodeList = [];

	static findStory(id) {
		return StoryNode.storyNodeList.find((storyNode) => storyNode.id === id);
	}

	addPrompt(prompt) {
		this.prompts.push(prompt);
		this.children.push(null);
	}

	// Sets the child node at the specified index and sets the parent of the child node to this node
	setChild(index, child) {
		if (child.parent) {
			return;
		}
		if (index < 0 || index >= this.children.length) {
			return;
		}
		this.children[index] = child;
		child.parent = this;
		this.updateMaxDepth();
	}

	updateMaxDepth() {
		let maxDepth = 1;
		for (const child of this.children) {
			if (child) {
				maxDepth = Math.max(maxDepth, child.maxDepth + 1);
			}
		}
		this.maxDepth = maxDepth;

		if (this.parent) {
			this.parent.updateMaxDepth();
		}
	}

	// Takes the story node and the index of the prompt that was selected to create a new story using aiGeneration
	// Return the new story node
	generateChildFromSelection(index) {
		// Do not generate if the child already exists
		if (this.children[index]) {
			return Promise.resolve(this.children[index]);
		}
		// Generate a story summary
		return this.generateStorySummary().then((storySummary) => {
			// Create a prompt by combining the previous story with the selected prompt
			const prompt = `Story so far: ${storySummary}\n\nOption chosen: ${this.prompts[index]}\n\nContinue the CYOA story in 2nd person, but don't finish it, telling it from the protagonist's perspective: `;
			return AiGeneration.text(prompt, 1024).then((story) => {
				// Generate new prompts for the new story
				return AiGeneration.promptOptions(story).then((prompts) => {
					// Create a new StoryNode with the generated story and the generated prompts
					const newStoryNode = new StoryNode(story, this.prompts[index], prompts);
					this.setChild(index, newStoryNode);
					return newStoryNode;
				});
			});
		});
	}

	// Generate a summary of the story so far by combining the story of this node with the story summaries of its parents
	// if they exist, and using its own story if it is the root node. This should only be called once per node.
	generateStorySummary() {
		if (this.storySummary) {
			return Promise.resolve(this.storySummary);
		}
		if (this.parent) {
			return this.parent.generateStorySummary().then((summary) => {
				return AiGeneration.updateSummary(summary, this.story).then((updatedSummary) => {
					this.storySummary = updatedSummary;
					return updatedSummary;
				});
			});
		} else {
			return AiGeneration.summary(this.story).then((summary) => {
				this.storySummary = summary;
				return summary;
			});
		}
	}
}