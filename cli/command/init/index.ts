import {createCommand, execCommand} from '../../../command/command';
import {bold, green} from '../../../color';
import {mkdirSync, existsSync, writeFileSync} from 'fs';
import {join} from 'path';
import { getPackageInstallType, readPackageJson, ROOT_DIR, updatePackageJson } from '../../../pkg';
import { create } from '../create';

export const init = createCommand({
	name: 'init',
	describe: 'Init Command Line Interface',

	options: {
		dirName: {
			desc: 'Dir name',
			type: 'string',
			default: 'cli',
		},
	},

	async handler(argv, {console, describe}) {
		console.important(describe);
		
		const cliDir = join(ROOT_DIR, argv.dirName);
		const cliIndex = join(cliDir, 'index.ts');

		console.spinner(`Create '${cliDir}'`).try(() => {
			mkdirSync(cliDir, {
				recursive: true,
				mode: '0777',
			});
		});

		if (!existsSync(cliIndex)) {
			console.spinner(`Create '${cliIndex}'`).try(() => {
				const isProd = getPackageInstallType(__dirname) === 'self';
				const pkgName = isProd ? '../command/command' : '@mail-core/cli';

				writeFileSync(cliIndex,
					`import {initCLI} from '${pkgName}';\n` +
					`\n` +
					`initCLI(\n` +
					`	// Env\n` +
					`	{__dirname},\n` +
					`\n` +
					`	// Command List\n` +
					`);\n` +
					`\n`
				);
			});

			await execCommand(create, {
				$0: argv.$0,
				_: argv._,
				name: 'demo',
				desc: 'Demo command',
			});
		}

		const pkg = readPackageJson();

		if (!pkg.bin) {
			pkg.bin = './cli/index.js';
			updatePackageJson(undefined, pkg);
		}

		if (!pkg.scripts?.cli || /mail-core-cli/.test(pkg.scripts?.cli)) {
			pkg.scripts!.cli = 'npx mail-core-cli local';
			updatePackageJson(undefined, pkg);
		}

		const binName = typeof pkg.bin === 'string' ? pkg.name : Object.keys(pkg.bin!)[0];

		console.hr();
		console.important('Done, use:');
		console.list([
			[green('npm run cli -- --help'), 'Local running (ex. for testing)'],
			[bold.green(`npx ${binName} --help`), 'Production (run inside another package)'],
		]);
	},
});

