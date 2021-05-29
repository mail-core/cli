import { resolve } from 'path';
import { spawn } from 'child_process';
import { createCommand } from '../../../command/command';
import type { ExtendedConsole } from '../../../console';

export function runFile(console: ExtendedConsole, file: string, args: string[], rest: Record<string, any>) {
	delete (rest as any)._;
	delete (rest as any).$0;
	
	Object.entries(rest).forEach(([key, val]) => {
		args.push(`--${key}=${val}`);
	});
	
	const RUN_CMD = resolve(__dirname, '..', '..', 'run');

	console.verbose('run:', RUN_CMD, file, args);

	const child = spawn(RUN_CMD, [file].concat(args), {
		stdio: 'inherit',
		cwd: process.cwd(),
		env: process.env,
	});

	child.on('close', (code) => {
		console.verbose(`Exit code:`, code);
		process.exit(code);
	});

	return child;
}

export const run = createCommand({
	name: 'run',
	describe: 'Run ts/js with ts-node or node',
	
	options: {
		file: {
			desc: '*.{ts,js} file',
			type: 'string',
			positional: true,
			interactive: true,
			demandOption: true,
		},

		args: {
			desc: 'Arguments',
			array: true,
			type: 'string',
			default: [] as string[],
			positional: true,
		},
	},
	
	async handler({file, args, ...rest}, {console}){
		await runFile(console, file, args, rest);
	},
});


