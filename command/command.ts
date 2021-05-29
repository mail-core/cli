import { realpathSync, existsSync } from 'fs';
import { underline, bold, red } from '../color';
import { sep } from 'path';
import * as yargs from 'yargs';
import type { OptionsMap, Argv, OptionWithArgMap } from '../args';
import { interactive } from '../interactive/interactive';
import { addProcessExitListener, ProcessExitEvent } from '../process/exit';
import { ExtendedConsole, createPackageExtendedConsole, verbose } from '../console/console';
import { stopAllSpinners } from '../console/spinner';
import { readPackageJson } from '../pkg';
import boxen = require('boxen');
import { startProcessSummary } from '../process/summary';
import Chalk = require('chalk');

const { command, parse, demandCommand, recommendCommands } = yargs;
const { strictCommands } = yargs as any as { // 🤦🏻‍♂️ todo: PR → @types
	strictCommands(): void;
};
const defaultActiveConsole = createPackageExtendedConsole(
	__dirname,
	process.argv.includes('--yes'),
);

let activeCommand: Command<any> | null = null;
let activeCommandArgv: Argv<any> | null = null;
let activeCommandEnv: CommandEnv<any> | null = null;

export type CommandEnv<O extends OptionsMap> = (
	& Pick<Command<O>,
		| 'name'
		| 'describe'
		| 'hidden'
	>
	& {
		style: typeof Chalk;
		console: ExtendedConsole;
		options: OptionWithArgMap<O>;
		exit: (code: number) => void;
		fail: (err: Error) => void;
	}
);

export type Command<O extends OptionsMap> = {
	readonly name: string | string[];
	readonly aliases?: string[];
	readonly describe?: string
	readonly hidden?: boolean;
	readonly options: O;
	readonly check?: (argv: Argv<O>) => true;
	readonly handler: (argv: Argv<O>, env: CommandEnv<O>) => void | Promise<void>;
	readonly exitHandler?: (evt: ProcessExitEvent, argv: Argv<O>, env: CommandEnv<O>) => void | Promise<void>;
};

export type CLIScheme = (
	| Command<any>
	| Record<string, Command<any>[]>
)

export function createCommand<O extends OptionsMap>(cmd: Command<O>) {
	verbose(`[createCommand] ${cmd.name} (${cmd.describe})`);
	return cmd;
}

export function getActiveConsole(): ExtendedConsole {
	return activeCommandEnv?.console || defaultActiveConsole;
}

export async function execCommand<O extends OptionsMap>(
	cmd: Command<O>,
	argv: Argv<O> | string[],
) {
	if (Array.isArray(argv)) {
		verbose(`[execCommand.raw.arv] ${cmd.name} (${cmd.describe}):`, argv);
		argv = parse(argv) as Argv<O>;
	}

	verbose(`[execCommand] ${cmd.name} (${cmd.describe}):`, argv);

	const env = createEnv(argv, cmd);

	cmd.check && cmd.check(argv);
	await cmd.handler(argv, env);
}

export type CLIEnv = {
	__dirname: string;
}

function printErrorReason(console: ExtendedConsole, reason: any) {
	console.hr();

	if (reason instanceof Error) {
		console.verbose('error:', reason);
		console.raw.error(bold.red(reason.stack || `${reason.name}: ${reason.message}`));
	} else if (reason && reason.stderr) {
		if (reason.stdout) {
			console.raw.log(reason.stdout);
			console.hr();
		}

		console.raw.error(red(reason.stderr));
		process.exit(reason.code || 1);
	} else {
		console.raw.error(typeof reason === 'string' ? red(reason) : reason);
	}
}

export function initCLI(env: CLIEnv, ...scheme: CLIScheme[]) {
	const pkg = readPackageJson(env.__dirname);
	const showProcessSummary = startProcessSummary();

	verbose(`[initCLI] env:`, env, scheme);
	verbose(`[initCLI] process.version:`, process.version);

	// v12+
	if (!/^v([0-9]+[2-9]|[2-9][0-9]+)/.test(process.version)) {
		console.warn(boxen(
			bold.yellow(`${underline(pkg.name)}: NodeJS ${process.version} not supported, try: \`nvm use 12\``),
			{padding: 1, borderStyle: 'bold', borderColor: 'yellow', margin: 1},
		));
	}

	scheme.forEach(cmdOrMap => {
		if (isCommandDescriptor(cmdOrMap)) {
			initCommand(cmdOrMap);
		} else {
			Object.entries(cmdOrMap).forEach(([scope, list]) => {
				list.forEach((cmd) => {
					initCommand(cmd, scope);
				});
			});
		}
	});

	demandCommand(1, '');
	recommendCommands();
	strictCommands();

	addProcessExitListener((evt) => {
		const console = getActiveConsole();
		const exit = () => {
			if (evt.type === 'uncaughtException') {
				console.verbose('uncaughtException:', evt.reason);
				showProcessSummary();
				printErrorReason(console, evt.reason);
				process.exit(1);
			} else if (evt.type !== 'exit') {
				console.verbose(`Command exit by "${evt.type}": ${evt.signal}`);
				showProcessSummary();
				process.exit();
			} else {
				showProcessSummary();
			}
		};

		if (activeCommand && activeCommand.exitHandler && activeCommandArgv && activeCommandEnv) {
			const val = activeCommand.exitHandler(evt, activeCommandArgv, activeCommandEnv);
			
			val && val
				.catch((reason) => {
					printErrorReason(console, reason);
				})
				.then(() => {
					showProcessSummary();
					process.exit(0);
				});
		} else {
			exit();
		}
	});

	return parse();
}

function isCommandDescriptor(x: unknown): x is Command<any> {
	return typeof x === 'object' && !!x && ('options' in x);
}

function initCommand(cmd: Command<OptionsMap>, scope?: string) {
	verbose(`[initCommand] ${cmd.name} (${cmd.describe}), scope: ${scope}`);

	const options = Object.entries(cmd.options);
	const name = (scope ? `${scope}-${cmd.name}` : cmd.name) + options.reduce((list, [name, opt]) => {
		if ('positional' in opt) {
			if (opt.demandOption) {
				return `${list} <${name}${opt.array ? '..' : ''}>`;
			}

			return `${list} [${name}${opt.array ? '..' : ''}]`;
		}
		return list
	}, '');

	command({
		command: name,
		aliases: cmd.aliases,
		
		builder(yargs) {
			options.forEach(([name, opt]) => {
				if ('positional' in opt) {
					yargs.positional(name, opt);
				} else {
					yargs.option(name, opt);
				}
			});

			return yargs
				.check(cmd.check || (() => true))
				.alias('help', 'h')
		},
		
		describe: cmd.hidden ? undefined : cmd.describe || '<<description undefined>>',
		
		async handler(argv) {
			const env = createEnv(argv, cmd);

			env.console.verbose(`[handler] ${cmd.name} (${cmd.describe}):`, argv);

			activeCommand = cmd;
			activeCommandArgv = argv;
			activeCommandEnv = env;

			try {
				await interactiveOptions(argv, options);
				await cmd.handler(argv, env);
			} catch (err) {
				stopAllSpinners('fail');
				env.console.fail(`Command "${cmd.name}" failed`);
				printErrorReason(env.console, err);
				throw err;
			}
		},
	});
}

async function interactiveOptions<T extends OptionsMap>(
	argv: Argv<T>,
	options: Array<[keyof T, T[keyof T]]>,
) {
	for (const [key, opt] of options) {
		const type = opt.type === 'string' ? 'input' : 'confirm';

		if (opt.interactive && !argv[key]) {
			do {
				const {value} = await interactive({
					value: {
						message: `Enter "${opt.describe || key}":`,
						type,
						value: opt.default,
					},
				});

				argv[key] = value;
			} while (type === 'input' && !argv[key]);
		}
	}
}

function createEnv<O extends OptionsMap>(argv: Argv<O>, cmd: Command<O>): CommandEnv<O> {
	let cwd = process.cwd();
	
	if (argv.$0) {
		if (existsSync(argv.$0)) {
			cwd = realpathSync(argv.$0);
		} else {
			cwd = realpathSync(argv.$0.split(sep).slice(0, -1).join(sep));
		}
	}

	verbose(`[createEnv] ${cmd.name} (${cmd.describe}): cwd = ${cwd}`);

	const console = createPackageExtendedConsole(cwd ? realpathSync(cwd) : cwd, !!argv.yes);
	const options = Object
		.entries(cmd.options)
		.reduce((map, [name, props]) => ({
			...map,
			[name]: {
				...props,
				name,
				value: argv[name],
			},
		}), {} as OptionWithArgMap<O>);
	;
	
	return {
		style: Chalk,
		console,
		
		exit(code) {
			process.exit(code);
		},

		fail(err: Error) {
			console.fail(`→ ${cmd.describe} failed:`, err);
			process.exit(1);
		},

		...cmd,
		options,
	};
}
