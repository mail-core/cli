import { resolve } from 'path';
import { spawn } from 'child_process';
import { createCommand } from '../../../command/command';
import { ROOT_DIR } from '../../../pkg';
import { runFile } from '../run';

export const local = createCommand({
	name: 'local',
	describe: 'Local run cli-command',
	
	options: {
		cmd: {
			desc: 'Command name',
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
	
	async handler({cmd, args, ...rest}, {console}){
		await runFile(
			console,
			resolve(ROOT_DIR, 'cli'),
			[cmd].concat(args),
			rest,
		);
	},
});


