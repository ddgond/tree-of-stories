import Head from 'next/head';
import Link from "next/link";

export default function ErrorPage() {
    return (
        <div>
            <Head>
                <title>404 - Page not found</title>
            </Head>
            <main>
                <h1>404 - Page not found</h1>
                <Link href={`/`}>Go Home</Link>
            </main>
        </div>
    )
}
