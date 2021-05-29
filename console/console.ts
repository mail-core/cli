import { readPackageJson, PackageJson } from '../pkg/pkg';
import { createSpinner, SpinnerOptions, Spinner } from './spinner';
import { underline, gray, red, green, bold, yellow, magenta, cyan} from '../color';
import { CLITools, createInteractiveTools, interactiveToolNewLine } from '../interactive/interactive';
import { list, ListOptions } from './list';

let VERBOSE_ENABLED = (
	process.argv.includes('--verb') ||
	process.argv.includes('--verbose') ||
	process.argv.includes('--verbose=true')
);

export type ExtendedConsole = (
	& Console
	& {
		label: string;
		spinner: (text: string, opts?: SpinnerOptions) => Spinner;
		pkg: PackageJson;
		ok: Console['log'];
		done: Console['log'];
		fail: Console['log'];
		important: Console['log'];
		list: (items: Array<string | string[]>, options?: ListOptions) => void
		nl: () => void;
		hr: (len?: number) => void;
		verbose: Console['log'];
		raw: Console;
		cli: CLITools;
	}
);

export function applyStyle(style: (v: unknown) => string, ...args: unknown[]) {
	return args.map(v => /string/.test(typeof v) ? style(v) : v);
}

export function createExtendedConsole(label: string, pkg?: PackageJson, yes?: boolean): ExtendedConsole {
	const logger = {
		label,
		pkg: pkg || readPackageJson(),
		cli: createInteractiveTools({prefix: label, yes}),

		nl() {
			interactiveToolNewLine.before = false;
			interactiveToolNewLine.after = false;
			console.log('');
		},

		hr(len: number = 10) {
			interactiveToolNewLine.before = false;
			interactiveToolNewLine.after = false;
			console.log(gray(label, '·'.repeat(len)));
		},

		spinner(text: string | undefined, opts: SpinnerOptions = {}) {
			return createSpinner({
				...opts,
				text,
				prefixText: label,
			});
		},

		ok(...args: unknown[]) {
			interactiveToolNewLine.touch(label);
			console.log(...applyStyle(green, label, ...args));
		},

		done(...args: unknown[]) {
			interactiveToolNewLine.touch(label);
			console.log(...applyStyle(green, label, ...args));
		},

		fail(...args: unknown[]) {
			interactiveToolNewLine.touch(label);
			console.log(...applyStyle(red, label, ...args));
		},

		info(...args: unknown[]) {
			interactiveToolNewLine.touch(label);
			console.info(...applyStyle(cyan, label, ...args));
		},

		log(...args: unknown[]) {
			interactiveToolNewLine.touch(label);
			console.log(label, ...args);
		},
		
		error(...args: unknown[]) {
			interactiveToolNewLine.touch(label);
			console.error(...applyStyle(red, label, ...args));
		},

		warn(...args: unknown[]) {
			interactiveToolNewLine.touch(label);
			console.warn(...applyStyle(yellow, label, '⚠️ ', ...args));
		},

		important(...args: unknown[]) {
			interactiveToolNewLine.touch(label);
			console.log(label, ...applyStyle(bold, ...args));
		},

		verbose(...args: unknown[]) {
			interactiveToolNewLine.touch(label);
			verbose(label, ...args);
		},

		list(items: Array<string | string[]>, options?: ListOptions) {
			list(logger, items, options);
		},
	};

	return {
		...console,
		...logger,
		raw: console,
	};
}

export function verbose(...args: unknown[]) {
	if (VERBOSE_ENABLED) {
		console.warn(...applyStyle(magenta, ...args));
	}
}

export function verboseEnabled(state: boolean) {
	VERBOSE_ENABLED = state;
}

export function createAppExtendedConsole(): ExtendedConsole {
	const pkg = readPackageJson();
	return createPackageExtendedConsole(pkg);
}

export function createPackageExtendedConsole(dirname: string, yes?: boolean): ExtendedConsole;
export function createPackageExtendedConsole(pkg: PackageJson, yes?: boolean): ExtendedConsole;
export function createPackageExtendedConsole(dirnameOrPkg: string | PackageJson, yes?: boolean): ExtendedConsole {
	const pkg = typeof dirnameOrPkg === 'string' ? readPackageJson(dirnameOrPkg) : dirnameOrPkg;
	const label = `${underline(pkg.name)}${gray(`@${pkg.version}`)}`;
	
	return createExtendedConsole(label, pkg, yes);
}
