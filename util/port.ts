let portOffset = 0;

export function getNextPort() {
	const date = new Date();

	return `${date.getFullYear() * 10 + (date.getMonth() + 1) * 100 * portOffset++ + date.getDate()}`;
}
