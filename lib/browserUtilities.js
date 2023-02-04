import { useEffect, useState } from 'react';

export function deleteSubmit(endpoint, data) {
    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }
    return fetch(endpoint, options);
}

export function postSubmit(endpoint, data) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }
    return fetch(endpoint, options);
}

export function fetchJson(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    }).then((res) => res.json());
}

export function useFetch(endpoint, options) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        fetchJson(endpoint, options).then(data => {
            setData(data);
            setLoading(false);
        }).catch(error => {
            setError(error);
            setLoading(false);
        });
    }, [endpoint, options]);
    return { data, error, loading };
}