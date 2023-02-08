// A standard Tree node that contains a story, a title, a pointer to its parent node (if it exists),
// and a list of prompts for continuing the story along child nodes. These child nodes are only created once a user
// has selected a prompt to continue the story.
import {generateRandomId, wordCount} from "./utilities.js";
import AiGeneration from "./AiGeneration.js";
import {getNamedRouteRegex} from "next/dist/shared/lib/router/utils/route-regex";
import Genre from "./Genre";
import Statistics from "./Statistics";

export default class StoryNode {
	constructor(story, title, prompts) {
		this.id = generateRandomId()
		this.story = story;
		this.title = title;
		this.prompts = prompts;
		this.storySummary = null; // This is a summary of the story so far, including details from the parent nodes. This is only generated when the first child is created for efficiency.
		this._genre = null; // The genre of the story. This is only generated when the first child is created for efficiency.
		// Instantiate children node list with null values equal to the number of prompts
		this.parent = null;
		this.children = new Array(prompts.length).fill(null);
		this.maxDepth = 1; // The maximum depth of the tree from this node
		this.totalChildren = 0; // The total number of children in the tree from this node
		this.wordCount = wordCount(story); // The number of words in this node's story
		this.childrenWordCount = 0; // The total number of words in the tree from this node (not including this node)
		this.isRoot = false;
		StoryNode.storyNodeList.push(this);
		Statistics.storyNodesCreated.increment();
	}

	static storyNodeList = [];

	static findStory(id) {
		return StoryNode.storyNodeList.find((storyNode) => storyNode.id === id);
	}

	static fromJson(json) {
		const storyNode = new StoryNode(json.story, json.title, json.prompts);
		storyNode.id = json.id;
		storyNode.storySummary = json.storySummary;
		storyNode._genre = json.genre;
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
			genre: this._genre,
			children: this.children.map((child) => child ? child.toJson() : null),
			maxDepth: this.maxDepth,
			totalChildren: this.totalChildren,
			childrenWordCount: this.childrenWordCount,
		};
	}

	toMetadata() {
		return {
			id: this.id,
			story: this.story,
			title: this.title,
			storyTitle: this.storyTitle,
			prompts: this.isRoot ? this.prompts.map((prompt, i) => this.children[i] ? this.prompts[i] : null) : this.prompts,
			parent: this.parent ? this.parent.toLinkedMetadata() : null,
			children: this.children.map(child => child ? child.toLinkedMetadata() : null),
			history: this.history
		};
	}

	toLinkedMetadata() {
		return {
			id: this.id,
			title: this.title,
			maxDepth: this.maxDepth,
			totalChildren: this.totalChildren,
			totalWordCount: this.totalWordCount,
		};
	}

	get totalWordCount() {
		return this.wordCount + this.childrenWordCount;
	}

	get storyTitle() {
		if (this.parent === null || this.parent.parent === null) {
			return this.title;
		}
		return this.parent.storyTitle;
	}

	get genre() {
		if (this._genre) {
			return this._genre;
		}
		if (!this.parent) {
			return '';
		}
		return this.parent.genre;
	}

	set genre(genre) {
		this._genre = genre;
	}

	get history() {
		if (!this.parent) {
			return [];
		}
		const parentContext = {
			id: this.parent.id,
			title: this.parent.title,
			story: this.parent.story,
		};
		if (this.parent.parent === null) {
			return [parentContext];
		}
		return this.parent.history.concat([parentContext]);
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

	delete() {
		if (this.parent) {
			const index = this.parent.children.indexOf(this);
			if (this.parent.parent === null) {
				this.parent.prompts.splice(index, 1);
				this.parent.children.splice(index, 1);
			} else {
				this.parent.children[index] = null;
			}
			this.parent.updateTreeData();
		}
		Statistics.storyNodesDeleted.increment();
		StoryNode.storyNodeList.splice(StoryNode.storyNodeList.indexOf(this), 1);
	}

	// Takes the story node and the index of the prompt that was selected to create a new story using aiGeneration
	// Return the new story node
	generateChildFromSelection(index, genre = "cyoa") {
		// Do not generate if the child already exists
		if (this.children[index]) {
			return Promise.resolve(this.children[index]);
		}
		if (this.isRoot) {
			const prompt = `Story genre: ${genre}\n\nStory title: ${this.prompts[index]}\n\nCreate the start of a Choose-your-own-adventure story in 2nd person, but don't finish it, telling it from the protagonist's perspective, do not list choices: `;
			return AiGeneration.text(prompt, 1024).then((story) => {
				// Generate new prompts for the new story
				return AiGeneration.promptOptions(story, '', genre).then((prompts) => {
					// Create a new StoryNode with the generated story and the generated prompts
					const newStoryNode = new StoryNode(story, this.prompts[index], prompts);
					newStoryNode.genre = genre;
					Statistics.storyNodesCreated.increment();
					Statistics.genreStoryNodesCreated.get(genre).increment();
					this.setChild(index, newStoryNode);
					return newStoryNode;
				});
			});
		} else {
			// Generate a story summary
			return this.generateStorySummary().then((storySummary) => {
				Statistics.storySummariesCreated.increment();
				// Create a prompt by combining the previous story with the selected prompt
				const trope = Genre.tropeFromGenre(this.genre);
				let summaryAndStory = storySummary;
				if (!this.parent.isRoot) {
					summaryAndStory = `${storySummary}\n\nRecent context: ${this.story}`
				}
				const prompt = `Story genre: ${this.genre}\n\nStory title: ${this.storyTitle}\n\nStory so far: ${summaryAndStory}\n\nOption chosen: ${this.prompts[index]}\n\nUsing the trope "${trope}" (but not mentioning the trope outright), continue the Choose-your-own-adventure story in 2nd person, but don't finish it, telling it from the protagonist's perspective, do not list choices: `;
				return AiGeneration.text(prompt, 1024).then((story) => {
					// Generate new prompts for the new story
					return AiGeneration.promptOptions(story, storySummary, this.genre).then((prompts) => {
						// Create a new StoryNode with the generated story and the generated prompts
						const newStoryNode = new StoryNode(story, this.prompts[index], prompts);
						Statistics.storyNodesCreated.increment();
						Statistics.genreStoryNodesCreated.get(this.genre).increment();
						this.setChild(index, newStoryNode);
						return newStoryNode;
					});
				});
			});
		}
	}

	// Generate a summary of the story so far by combining the story of this node with the story summaries of its parents
	// if they exist, and using its own story if it is the root node. This should only be called once per node.
	generateStorySummary() {
		if (this.storySummary) {
			return Promise.resolve(this.storySummary);
		}
		if (this.parent && !this.parent.isRoot) {
			return this.parent.generateStorySummary().then((summary) => {
				return AiGeneration.updateSummary(summary, this.story).then((updatedSummary) => {
					Statistics.storySummariesCreated.increment();
					this.storySummary = updatedSummary;
					return updatedSummary;
				});
			});
		} else {
			return AiGeneration.summary(this.story).then((summary) => {
				Statistics.storySummariesCreated.increment();
				this.storySummary = summary;
				return summary;
			});
		}
	}
}