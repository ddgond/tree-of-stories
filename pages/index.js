import Head from 'next/head';
import StoryNode from "../components/storyNode.js";
import { useFetch } from "../lib/browserUtilities.js";
import StoryNodePrompts from "../components/storyNodePrompts.js";

export default function Home() {
    const { data: storyNode, error, loading } = useFetch(`/api/storyRoot`);
    if (error) {
        return <div>failed to load</div>;
    }
    if (!storyNode) {
        return <div>loading...</div>;
    }
    return (
        <div>
            <Head>
                <title>Home</title>
            </Head>
          <main>
            <StoryNode storyNode={storyNode}/>
            <StoryNodePrompts storyNode={storyNode}/>
          </main>
        </div>
    )
}
