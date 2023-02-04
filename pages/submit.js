import Head from 'next/head';
import {router} from "next/router";
import {useState} from "react";
import {postSubmit} from "../lib/browserUtilities.js";
import styles from "./admin.module.css";

export default function Submit() {
    const [error, setError] = useState(null);

    function handleSubmit(event) {
        event.preventDefault();
        const data = {
            prompt: event.target.prompt.value,
            genre: event.target.genre.value.toLowerCase(),
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
                <title>Submit a New Story</title>
            </Head>
            <main>
                <h1>Submit a New Story</h1>
                <div>
                    <h2>Submission Form</h2>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <input type="text" name="prompt" placeholder="Enter a new story prompt"/>
                        <input type="text" name="genre" placeholder="Enter a genre"/>
                        <input type="password" name="password" placeholder="Enter the password"/>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div>
                    <h2>Available Genres</h2>
                    <ul>
                        <li>Adventure</li>
                        <li>Comedy</li>
                        <li>Cyoa</li>
                        <li>Drama</li>
                        <li>Horror</li>
                        <li>Romance</li>
                    </ul>
                </div>
                <div className={styles.error}>
                    {error && <div>{error}</div>}
                </div>
            </main>
        </div>
    )
}
