// A standard Tree node that contains a story, a title, a pointer to its parent node (if it exists),
// and a list of prompts for continuing the story along child nodes. These child nodes are only created once a user
// has selected a prompt to continue the story.
import {generateRandomId, wordCount} from "./utilities.js";
import AiGeneration from "./AiGeneration.js";

export default class StoryNode {
	constructor(story, title, prompts) {
		this.id = generateRandomId()
		this.story = story;
		this.title = title;
		this.prompts = prompts;
		this.storySummary = null; // This is a summary of the story so far, including details from the parent nodes. This is only generated when the first child is created for efficiency.
		this.parent = null;
		// Instantiate children node list with null values equal to the number of prompts
		this.children = new Array(prompts.length).fill(null);
		this.maxDepth = 1; // The maximum depth of the tree from this node
		this.totalChildren = 0; // The total number of children in the tree from this node
		this.wordCount = wordCount(story); // The number of words in this node's story
		this.childrenWordCount = 0; // The total number of words in the tree from this node (not including the title)
		StoryNode.storyNodeList.push(this);
	}

	static storyNodeList = [];

	static findStory(id) {
		return StoryNode.storyNodeList.find((storyNode) => storyNode.id === id);
	}

	static fromJson(json) {
		const storyNode = new StoryNode(json.story, json.title, json.prompts);
		storyNode.id = json.id;
		storyNode.storySummary = json.storySummary;
		json.children.forEach((child, index) => {
			if (child) {
				storyNode.setChild(index, StoryNode.fromJson(child));
			}
		});
		storyNode.maxDepth = json.maxDepth;
		storyNode.totalChildren = json.totalChildren;
		storyNode.childrenWordCount = json.childrenWordCount;
		return storyNode;
	}

	toJson() {
		return {
			id: this.id,
			story: this.story,
			title: this.title,
			prompts: this.prompts,
			storySummary: this.storySummary,
			children: this.children.map((child) => child ? child.toJson() : null),
			maxDepth: this.maxDepth,
			totalChildren: this.totalChildren,
			childrenWordCount: this.childrenWordCount,
		};
	}

	get totalWordCount() {
		return this.wordCount + this.childrenWordCount;
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
		this.updateTreeData();
	}

	updateTreeData() {
		let maxDepth = 1;
		let totalChildren = 0;
		let childrenWordCount = 0;
		for (const child of this.children) {
			if (child) {
				maxDepth = Math.max(maxDepth, child.maxDepth + 1);
				totalChildren += 1 + child.totalChildren;
				childrenWordCount += child.wordCount + child.childrenWordCount;
			}
		}
		this.maxDepth = maxDepth;
		this.totalChildren = totalChildren;
		this.childrenWordCount = childrenWordCount;

		if (this.parent) {
			this.parent.updateTreeData();
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