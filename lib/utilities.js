// Generates a random ID
import Logger from "./Logger";

export function generateRandomId() {
		return Math.random().toString(36).substring(2, 9);
}

// From https://stackoverflow.com/a/8831937
export function hashString(string) {
	let hash = 0;
	for (let i = 0, len = string.length; i < len; i++) {
		let chr = string.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}

export function wordCount(string) {
	return string.split(' ').length;
}

export function randomItem(array) {
	return array[Math.floor(Math.random() * array.length)];
}

export function padNumber(number) {
	if (number < 10) {
		return `0${number}`;
	}
	return number;
}

export function formatMoney(number) {
	return `$${number.toFixed(2)}`;
}

/**
 * Returns a string in the format YYYY-MM-DD HH:MM:SS
 * Pads the month, day, hour, minute, and second with a 0 if necessary
 * @returns {string}
 */
export function getCurrentTimeString() {
	const date = new Date();
	const year = date.getFullYear();
	const month = padNumber(date.getMonth() + 1);
	const day = padNumber(date.getDate());
	const hour = padNumber(date.getHours());
	const minute = padNumber(date.getMinutes());
	const second = padNumber(date.getSeconds());
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/**
 * Returns a string in the format YYYY-MM-DD
 * Pads the month and day with a 0 if necessary
 * @returns {string}
 */
export function getCurrentDateString() {
	const date = new Date();
	const year = date.getFullYear();
	const month = padNumber(date.getMonth() + 1);
	const day = padNumber(date.getDate());
	return `${year}-${month}-${day}`;
}

export function onceADay(callback, hour=1) {
	const now = new Date();
	const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour, 0, 0, 0);
	const timeout = next.getTime() - now.getTime();
	setTimeout(() => {
		callback();
		onceADay(callback, hour);
	}, timeout);
}

export function requestToString(req) {
	return `${req.method} ${req.url}`;
}