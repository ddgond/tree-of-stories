import Head from 'next/head';
import {router} from "next/router";
import {useState} from "react";
import {postSubmit} from "../lib/browserUtilities.js";

export default function Submit() {
    const [error, setError] = useState(null);

    function handleSubmit(event) {
        event.preventDefault();
        const data = {
            prompt: event.target.prompt.value,
            password: event.target.password.value
        };
        postSubmit("/api/storyNode", data).then(res => {
            if (res.status !== 200) {
                setError(`${res.status}: ${res.statusText}`);
                return;
            }
            router.push("/");
        }).catch(error => {
            setError(error);
        });
    }

    return (
        <div>
            <Head>
                <title>Submit A New Story</title>
            </Head>
            <main>
                <div>
                    <h1>Submit A New Story</h1>
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="prompt" placeholder="Enter a new story prompt"/>
                        <input type="password" name="password" placeholder="Enter the password"/>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div>
                    {error && <div>{error}</div>}
                </div>
            </main>
        </div>
    )
}
