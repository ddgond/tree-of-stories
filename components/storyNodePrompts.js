import Prompt from "./prompt.js";

export default function StoryNodePrompts({storyNode}) {
    return <div className="prompts">
        {storyNode.prompts.map((prompt, index) => {
            return <div key={index}>
                <Prompt parent={storyNode} index={index}/>
            </div>
        })}
    </div>
}