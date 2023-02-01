// Generates a random ID
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