import type { PackageJson as FestPackageJson } from 'type-fest';
import { resolve, sep, dirname } from 'path';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { yellow, bold } from '../color';
import appRootPath = require('app-root-path');

export type PackageJson = FestPackageJson & {
	$path(): string;
	$name(): string;
	$update(): void;
}

export type PackageJsonHook = (
	| 'prepublish'
	| 'prepare'
	| 'prepublishOnly'
	| 'prepack'
	| 'postpack'
	| 'publish'
	| 'postpublish'
	| 'preinstall'
	| 'install'
	| 'postinstall'
	| 'preuninstall'
	| 'uninstall'
	| 'postuninstall'
	| 'preversion'
	| 'version'
	| 'postversion'
	| 'pretest'
	| 'test'
	| 'posttest'
	| 'prestop'
	| 'stop'
	| 'poststop'
	| 'prestart'
	| 'start'
	| 'poststart'
	| 'prerestart'
	| 'restart'
	| 'postrestart'
);

export type PkgRunEnv = (
	| 'dev'
	| 'module'
	| 'npx'
);

export interface PkgReadOptions {
	cache?: boolean;
}

export function getPkgRunEnv(dirname: string) {
	if (dirname.includes(`${sep}_npx${sep}`)) {
		return 'npx';
	}

	return dirname.includes('node_modules') ? 'module' : 'dev';
}

export const PKG_RUN_ENV = getPkgRunEnv(__dirname);
export const IS_NPX_ENV = PKG_RUN_ENV === 'npx';

export const CWD_DIR = process.cwd();
export const ROOT_DIR = IS_NPX_ENV ? CWD_DIR : appRootPath.toString();

export function getModuleRootDir(__dirname: string) {
	return dirname(findNearestPackageJson(__dirname) || __dirname);
}

const JSON_CACHE = {} as {
	[file:string]: {
		file: string;
		json: PackageJson | undefined;
	};
}

export function dropPackageJsonCache() {
	Object.keys(JSON_CACHE).forEach(key => delete JSON_CACHE[key]);
}

export function readPackageJson(relativeDir: string = ROOT_DIR, options: PkgReadOptions = {}): PackageJson {
	const {cache = true} = options;
	const file = findNearestPackageJson(relativeDir)

	if (!file) {
		return setup(relativeDir, {});
	}

	if (!JSON_CACHE[file] || !cache) {
		const pkg = existsSync(file) ? JSON.parse(readFileSync(file, 'utf-8')) : {};

		JSON_CACHE[file] = pkg;
	}

	return setup(relativeDir, JSON_CACHE[file]);
}

export function findNearestPackageJson(relativeDir: string): string | undefined {
	if (relativeDir === ROOT_DIR && IS_NPX_ENV) {
		return resolve(ROOT_DIR, 'package.json');
	}

	let path = relativeDir;

	while (path !== sep && path) {
		let file = resolve(path, 'package.json');
		if (existsSync(file)) {
			return file;
		}

		path = resolve(path, '..');
	}

	return undefined
}

export function updatePackageJson(relativeDir: string = ROOT_DIR, patch: Partial<PackageJson>, options: PkgReadOptions = {}) {
	const file = findNearestPackageJson(relativeDir);

	if (!file) {
		console.warn(`update package json failed:`, {
			CWD_DIR,
			ROOT_DIR,
			PKG_RUN_ENV,
			relativeDir,
		});
		return;
	}

	const cached = readPackageJson(file);
	const actual = readPackageJson(file, {
		...options,
		cache: false,
	});

	Object.assign(actual, patch);
	Object.assign(cached, actual);

	writeFileSync(file, JSON.stringify(actual, null, 2) + '\n');
}

export function registerRunCommand(preferName: string, cmd: string): string {
	const pkg = readPackageJson();
	const scripts = pkg.scripts || {};
	const existsName = Object.keys(scripts).find((key) => {
		return `${scripts[key]}`.trim().startsWith(cmd);
	});

	if (existsName) {
		return existsName;
	}

	if (preferName in scripts) {
		console.warn(yellow(`[${pkg.name} ${pkg.version}] registerRunCommand failed:`, bold(preferName)));

		return registerRunCommand(
			preferName.replace(/(?:-(\d+))?$/, (_, n) => `-${(parseInt(n, 10) || 0) + 1}`),
			cmd,
		);
	}

	scripts[preferName] = cmd;
	updatePackageJson(undefined, { scripts });

	return preferName;
}

export function runCommandByScriptHook(hook: PackageJsonHook, cmd: string, atFirst = true) {
	const scripts = readPackageJson().scripts || {};
	let exists = false;

	if (!scripts[hook]) {
		scripts[hook] = cmd;
	} else if ((scripts[hook] || '').includes(cmd)) {
		exists = true;
	} else {
		scripts[hook] = atFirst ? `${cmd} && ${scripts[hook]}` : `${scripts[hook]} && ${cmd}`;
	}

	updatePackageJson(undefined, { scripts });

	return exists;
}

export function hasPackageJsonDependency(pkg: PackageJson, depName?: string) {
	return !!(depName && pkg.dependencies && pkg.dependencies[depName]);
}

export function hasPackageJsonDevDependency(pkg: PackageJson, depName?: string) {
	return !!(depName && pkg.devDependencies && pkg.devDependencies[depName]);
}

export function hasPackageJsonPeerDependency(pkg: PackageJson, depName?: string) {
	return !!(depName && pkg.peerDependencies && pkg.peerDependencies[depName]);
}

export function removePackageJsonDependency(pkg: PackageJson, depName: string | RegExp) {
	function remove(deps: Record<string, string> = {}) {
		if (depName instanceof RegExp) {
			Object.keys(deps).forEach((key) => {
				if (depName.test(key)) {
					delete deps[key];
				}
			});
		} else {
			delete deps[depName];
		}
	}

	remove(pkg.dependencies);
	remove(pkg.devDependencies);
	remove(pkg.peerDependencies);
}

export function getPackageInstallType(__dirname: string) {
	const pkg = readPackageJson(__dirname);
	const appPkg = readPackageJson();

	switch (true) {
		case pkg === appPkg:
			return 'self';

		case hasPackageJsonDependency(appPkg, pkg.name):
			return true;

		case hasPackageJsonDevDependency(appPkg, pkg.name):
			return 'dev';

		default:
			return false;
	}
}

export function isRootPackage(__dirname: string) {
	return resolve(__dirname).split('node_modules').length === 2;
}


function setup(path: string, pkg: FestPackageJson): PackageJson {
	function prop(name: string, value: (arg: any) => string) {
		return {
			[name]: {
				enumerable: false,
				writable: false,
				configurable: false,
				value,
			},
		};
	}

	if ('$name' in pkg)  {
		return pkg as PackageJson;
	}

	Object.defineProperties(pkg, {
		...prop('$path', () => path),
		...prop('$name', () => `${pkg.name}${pkg.version ? `:${pkg.version}` : ``}`),
		...prop('$update', (patch: Partial<PackageJson>) => {
			updatePackageJson(path, patch);
			return path;
		}),
	});

	return pkg as PackageJson;
}
