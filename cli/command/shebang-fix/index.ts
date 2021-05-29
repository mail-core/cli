import {
	readdirSync,
	readFileSync,
	writeFileSync,
	existsSync,
} from 'fs';
import { join } from 'path';
import { createCommand } from '../../../command/command';
import { readPackageJson, runCommandByScriptHook, IS_NPX_ENV, getPackageInstallType, isRootPackage } from '../../../pkg/pkg';

export const shebangFix = createCommand({
	name: 'shebang-fix',
	describe: 'auto add shebang',
	
	options: {
		path: {
			type: 'string',
			default: './cli/',
			description: 'path to apply',
		},

		reg: {
			type: 'boolean',
			description: 'register on publishOnly hook'
		},
	},
	
	handler({path, reg}, {console, describe}) {
		const installType = getPackageInstallType(__dirname);

		if (!installType || !isRootPackage(__dirname) && installType !== 'self') {
			console.verbose('skipped');
			return;
		}

		const shebang = `#!/usr/bin/env node`;
		const fix = console.spinner(describe as string, {
			
		});

		try {
			if (!existsSync(path)) {
				fix.warn();
				return;
			}

			readdirSync(path).forEach((entry) => {
				const file = join(path, entry);

				if (/\.js$/.test(file)) {
					const content = readFileSync(file) + '';
					
					if (!content.includes(shebang)) {
						writeFileSync(file, `${shebang}\n\n${content}`);
					}
				}
			});
		} catch (err) {
			fix.fail();
			console.warn('shebang fix failed:', err);
			throw err;
		}

		fix.succeed();

		if (reg && !IS_NPX_ENV) {
			const fix = console.spinner('register prepublishOnly npm hook');
			
			if (readPackageJson() !== readPackageJson(__dirname)) {
				runCommandByScriptHook(
					'prepublishOnly',
					'npx mail-core-cli shebang-fix',
					false,
				);
				fix.succeed()
			} else {
				fix.warn();
			}
		}
	},
});
