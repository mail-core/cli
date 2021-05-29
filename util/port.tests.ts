import { getNextPort } from './port'

it('next port', () => {
	const prev = getNextPort();
	const next = getNextPort();

	expect(prev).not.toBe('');
	expect(next).not.toBe('');
	expect(prev).not.toBe(next);
});
