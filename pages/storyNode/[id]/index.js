import Head from 'next/head';
import StoryNode from "../../../components/storyNode.js";
import StoryNodeBreadcrumbs from "../../../components/storyNodeBreadcrumbs.js";
import { useRouter } from 'next/router'
import { useFetch } from "../../../lib/browserUtilities.js";
import Link from "next/link.js";
import StoryNodePrompts from "../../../components/storyNodePrompts.js";
import StoryNodeHistory from "../../../components/storyNodeHistory.js";

export default function StoryNodePage() {
    const router = useRouter();
    const { id } = router.query;
    const { data: storyNode, error, loading } = useFetch(`/api/storyNode/${id}`);
    if (loading) {
        return <div>loading...</div>;
    }
    if (!storyNode && error) {
        return <div>failed to load</div>;
    }
    return (
        <>
            <Head>
                <title>{`${storyNode.storyTitle} - ${storyNode.title}`}</title>
            </Head>
            <main>
                <StoryNode storyNode={storyNode}/>
                <StoryNodePrompts storyNode={storyNode}/>
                <StoryNodeHistory storyNode={storyNode}/>
                <StoryNodeBreadcrumbs storyNode={storyNode}/>
            </main>
        </>
    );
}