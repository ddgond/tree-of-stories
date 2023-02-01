import Layout from "../components/layout.js";
import Head from "next/head";
import '../styles/globals.css';
import { EB_Garamond as SerifFont, Inter as SansSerifFont } from '@next/font/google';

const serifFont = SerifFont({subsets: ['latin']});
const sansSerifFont = SansSerifFont({subsets: ['latin']});

export default function App({ Component, pageProps }) {
    return <Layout>
        <Head>
            <title>Tree of Stories</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </Head>
        <style jsx global>
            {`
                body {
                    font-family: ${serifFont.style.fontFamily}; 
                }
                .sans-serif {
                    font-family: Calibri, sans-serif;
                }
            `}
        </style>
        <Component {...pageProps} />
    </Layout>;
}