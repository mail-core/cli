import { createCommand } from '../../../command/command';
import { resolve, join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { getPackageInstallType, readPackageJson, ROOT_DIR } from '../../../pkg';
import { addProcessSummary } from '../../../process/summary';

const CLI_PATH = resolve(ROOT_DIR, 'cli');

export const create = createCommand({
	name: 'create',
	describe: 'Create CLI-Command ⌨️',
	
	options: {
		name: {
			desc: 'Name',
			type: 'string',
		},

		desc: {
			desc: 'Description',
			type: 'string',
		},

		demo: {
			desc: 'Disable process summary',
			hidden: true,
			type: 'boolean',
		},
	},
	
	async handler(argv, {console, describe, style}) {
		console.important(describe);

		const name = argv.name || await console.cli.input('Enter name:', '');
		const descr = argv.desc || await console.cli.input('Enter description:', '');
		const path = resolve(CLI_PATH, 'command', name);
		const fileName = join(path, 'index.ts');
		const varName = name.replace(/[-_](.)/g, (_, chr: string) => chr.toUpperCase());

		if (existsSync(path)) {
			console.fail(`${path} — exists`);
			return;
		}

		console.spinner(`Create '${path}'`).try(() => {
			mkdirSync(path, {recursive: true});
		});

		console.spinner(`Write '${fileName}'`).try(() => {
			const isProd = getPackageInstallType(__dirname) === 'self';
			const pkgName = isProd ? '../../../command/command' : '@mail-core/cli';
			const pkgNameColor = isProd ? '../../../color' : '@mail-core/cli/color';

			writeFileSync(fileName, 
				`import {createCommand} from '${pkgName}';\n` +
				`\n` +
				`export const ${varName} = createCommand({\n` +
				`	name: '${name}',\n` +
				`	describe: '${descr}',\n` +
				`\n` +
				`	options: {\n` +
				`		val: {\n` +
				`			desc: 'Any value',\n` +
				`			type: 'string',\n` +
				`			default: 'Wow!',\n` +
				`		},\n` +
				`	},\n` +
				`\n` +
				`	async handler(argv, {console, describe, options, style}) {\n` +
				`		// Print command description\n` +
				`		console.important(describe);\n` +
				`\n` +
				`		// Prompt user for option or use default\n` +
				`		const value = await console.cli.require(options.val);\n` +
				`\n` +
				`		// Print 'value' with style and color\n` +
				`		console.log('value:', style.bold.cyan(value), style.gray(argv.val));\n` +
				`	},\n` +
				`});\n` +
				`\n`
			);
		});

		console.spinner(`Register '${style.bold(name)}' command`).try(() => {
			const index = join(CLI_PATH, 'index.ts');
			
			writeFileSync(index, `${readFileSync(index)}`.replace(
				/(\n+initCLI\([^)]+)/,
				`\nimport {${varName}} from './command/${name}';` +
				`$1\t${varName},\n`,
			));
		});

		if (!argv.demo) {
			addProcessSummary(
				'Local running',
				style.cyan(`npm run cli -- ${name}`),
			);

			addProcessSummary(
				'Production (run inside another package)',
				style.cyan(`npx ${readPackageJson().name} ${name}`),
			);
		}
	},
});


