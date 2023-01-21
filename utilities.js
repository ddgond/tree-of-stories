// Generates a random ID
export function generateRandomId() {
		return Math.random().toString(36).substring(2, 9);
}