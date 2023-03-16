// Description: This file contains the code for text generation using the OpenAI API

/*
 * Example CURL request for OpenAI API
 * curl https://api.openai.com/v1/completions \
	  -H 'Content-Type: application/json' \
	  -H 'Authorization: Bearer YOUR_API_KEY' \
	  -d '{
	  "model": "text-davinci-003",
	  "prompt": "Say this is a test",
	  "max_tokens": 7,
	  "temperature": 0
	}'
 */

/*
 * Example response from OpenAI API
 * {
	  "id": "cmpl-uqkvlQyYK7bGYrRHQ0eXlWi7",
	  "object": "text_completion",
	  "created": 1589478378,
	  "model": "text-davinci-003",
	  "choices": [
	    {
	      "text": "\n\nThis is indeed a test",
	      "index": 0,
	      "logprobs": null,
	      "finish_reason": "length"
	    }
	  ],
	  "usage": {
	    "prompt_tokens": 5,
	    "completion_tokens": 7,
	    "total_tokens": 12
	  }
	}
 */

import { XMLHttpRequest } from "xmlhttprequest";
import Genre from "./Genre.js";
import Statistics from "./Statistics";
import Logger from "./Logger";

// Uses the OpenAI API to generate text from the prompt
function text(prompt, systemPrompt, maxTokens) {
	return new Promise((resolve, reject) => {
		Statistics.openAiRequests.increment();
		// Create the request
		const request = new XMLHttpRequest();
		request.open("POST", "https://api.openai.com/v1/chat/completions");
		request.setRequestHeader("Content-Type", "application/json");
		request.setRequestHeader(`Authorization`, `Bearer ${process.env.OPENAI_API_KEY}`);
		request.send(JSON.stringify({
			model: "gpt-4",
			messages: [{
				role: "system",
				content: systemPrompt
			},{
				role: "user",
				content: prompt,
			}],
			max_tokens: maxTokens,
			temperature: 0.7
		}));
		request.addEventListener("load", () => {
			const response = JSON.parse(request.responseText);
			Statistics.openAiPromptTokens.add(response.usage.prompt_tokens);
			Statistics.openAiCompletionTokens.add(response.usage.completion_tokens);
			// Check to make sure a choice was returned
			if (!response.choices || response.choices.length === 0) {
				Statistics.failedOpenAiRequests.increment();
				reject(`No choices returned from OpenAI API: ${request.responseText}`);
			} else {
				Statistics.openAiFinishReasons.get(response.choices[0].finish_reason).increment();
				// Return response with stripped whitespace
				resolve(response.choices[0].message.content.trim());
				Logger.openAiLog(prompt, response.choices[0].message.content.trim(), response.choices[0].finish_reason, response.usage.total_tokens);
			}
		});
		request.addEventListener("error", () => {
			Statistics.failedOpenAiRequests.increment();
			reject(request.responseText);
		});
	});
}

// Uses the OpenAI API to generate a story summary
function summary(story) {
	const systemPrompt = 'You are a smart story summarizer that keeps track of the most important parts of a Choose-Your-Own-Adventure story. Users give you a story and you must reply with a list of at most 10 bullet points summarizing the story so far. Write these bullet points in second person.'
	return text(story, systemPrompt, 768).then((response) => {
		return response;
	});
}

// Uses the OpenAI API to augment the most recent story summary with the new information from the story
function updateSummary(previousSummary, story) {
	return summary(`${previousSummary}\n\nThe new information:\n\n${story}`);
}

// Uses the OpenAI API to generate prompt options from the story
function promptOptions(story, summary, genre, optionCount=5) {
	const promptTypes = Genre.promptTypesFromGenre(genre);
	story = story.split('\n').filter(line => line.length > 0).join(' ');
	const systemPrompt = `You are a module of a Choose-Your-Own-Adventure AI that generates text-adventure-style options. These options describe actions the protagonist can take to continue from the current page. You will generate ${optionCount} text-adventure-style options in the corresponding option style. Do not reveal the option type. Your input is a JSON object, and your output should fit this format:\n${promptTypes.map((promptType, index) => `${index+1}) ${promptType} option`).join('\n')}`
	const input = JSON.stringify({
		storySoFar: summary,
		mostRecentPage: story,
	});
	return text(input, systemPrompt, 256).then((response) => {
		/*
		 * The response from the OpenAI API is a string with the following format, but an unpredictable number of new lines:
		 * 1) <option 1>
		 * 2) <option 2>
		 * 3) <option 3>
		 * 4) <option 4>
		 * 5) <option 5>
		 */
		// Split the response into an array of options
		const options = response.split(/\d\)/);
		// Remove the first element, which is an empty string
		options.shift();
		// Remove text surrounded by brackets and whitespace from each option
		for (let i = 0; i < options.length; i++) {
			options[i] = options[i].replaceAll(/\[.*]/g, "");
			options[i] = options[i].trim();
		}
		if (options.length !== optionCount) {
			Statistics.openAiIncorrectPromptOptionGeneration.increment();
			Logger.error(`Incorrect number of prompt options generated: ${options.length}`);
			throw `Incorrect number of prompt options generated: ${options.length}`;
		}
		return options;
	});
}

export default {
	text,
	summary,
	updateSummary,
	promptOptions
}