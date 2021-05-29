import { createCommand } from '../../../command/command';
import { ROOT_DIR, PKG_RUN_ENV } from '../../../pkg/pkg';

export const env = createCommand({
	name: 'env',
	describe: 'Print env && ROOT_DIR',
	options: {},
	
	async handler(argv, {console, describe, style: {bold, yellow}}) {
		const max = 16;

		console.log(arguments[1]);
		console.important(describe);

		console.log(bold('argv:'.padEnd(max)), argv);
		console.log(bold('process.version:'.padEnd(max)), process.version);
		console.log(bold('process.env:'.padEnd(max)), process.env);
		console.log(bold('PKG_RUN_ENV:'.padEnd(max)), yellow(PKG_RUN_ENV));
		console.log(bold('ROOT_DIR:'.padEnd(max)), yellow(ROOT_DIR));
	},
});


