import { createCommand, execCommand } from './command';

it('create', () => {
	const cmd = {
		name: 'foo',
		options: {},
		handler: () => {},
	};

	expect(createCommand(cmd)).toEqual(cmd);
});

it('execCommand', () => {
	let log = [] as any[];
	const cmd = createCommand({
		name: 'bar',
		options: {
			verbose: {
				type: 'boolean',
			},
		},
		check: (argv) => {
			log.push(argv);
			return true;
		},
		handler: (argv) => {
			log.push(argv);
		},
	});
	
	execCommand(cmd, {
		_: ['jest'],
		$0: 'jest',
		verbose: true,
	});

	expect(log.length).toBe(2);
	expect(log[0]._).toEqual(['jest']);
	expect(log[0].verbose).toBe(true);
	expect(log[0].verbose).toBe(log[1].verbose);
});
