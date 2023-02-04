import Head from 'next/head';
import {router, useRouter} from "next/router";
import {useState} from "react";
import {deleteSubmit} from "../../../lib/browserUtilities.js";
import styles from "../../admin.module.css";

export default function Delete() {
  const router = useRouter();
  const { id } = router.query;
  const [error, setError] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const data = {
      password: event.target.password.value
    };
    deleteSubmit(`/api/storyNode/${id}`, data).then(res => {
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
        <title>Delete a Story</title>
      </Head>
      <main>
        <h1>Delete a Story</h1>
        <div>
          <h2>Deletion Form</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input type="password" name="password" placeholder="Enter the password"/>
            <input type="submit" value="Submit"/>
          </form>
        </div>
        <div className={styles.error}>
          {error && <div>{error}</div>}
        </div>
      </main>
    </div>
  )
}
