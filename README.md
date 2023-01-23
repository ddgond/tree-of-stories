# tree-of-stories
An AI-powered CYOA storyteller.

Built with OpenAI GPT-3.

Idea very much inspired by Gwern Branwen's [Choose-Your-Own-Adventure AI Dungeon Games](https://gwern.net/CYOA).

# .env file format
```
OPENAI_API_KEY="YOUR_API_KEY"
STORY_SUBMISSION_SLUG="/slugAtWhichToAllowStorySubmissions"
STORY_DELETION_SLUG="/slugAtWhichToAllowStoryDeletions"
PORT=PORT_TO_RUN_SERVER_ON
DEBUGGING=TRUE_OR_FALSE (set to true to enable debugging mode in browser)
```