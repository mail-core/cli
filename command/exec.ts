import {
	spawn as nativeSpawn,
	SpawnOptions as NativeSpawnOptions,
	ChildProcess,
} from 'child_process';
import { Spinner, SpinnerOptions, createSpinner, isSpinnerInstance } from '../console/spinner';
import { verbose } from '../console';

export type SpawnOptions = NativeSpawnOptions & {
	spinner?: true | SpinnerOptions | Spinner;
}

export type SpawnPromise = Promise<{code: number; stdout: string; stderr: string;}> & ChildProcess & {
	spinner?: Spinner;
};

export function spawn(cmd: string, args: string[] = [], options: SpawnOptions = {}): SpawnPromise {
	const opts: SpawnOptions = {
		cwd: process.cwd(),
		env: process.env,
		stdio: options.spinner ? 'ignore' : 'inherit',
		...options,
	};
	
	let spinner: Spinner | undefined = undefined;
	let childProcess = {} as SpawnPromise;

	const promise = new Promise((resolve, reject) => {
		verbose(`[spawn] ${cmd}:`, args);
		
		let stdout = '';
		let stderr = '';

		childProcess = <SpawnPromise>nativeSpawn(cmd, args, opts);

		childProcess.stdout?.on('data', (chunk) => {
			stdout += chunk;
		});

		childProcess.stderr?.on('data', (chunk) => {
			stderr += chunk;
		});

		childProcess.on('close', (code) => {
			if (spinner) {
				spinner[code === 0 ? 'succeed' : 'fail']();
			}
			
			(code === 0 ? resolve : reject)({
				code,
				stdout,
				stderr,
			});
		});
	});

	if (isSpinnerInstance(opts.spinner)) {
		spinner = opts.spinner;
	} else if (opts.spinner) {
		spinner = createSpinner(promise, opts.spinner === true ? {} : opts.spinner);
	}
	
	Object.defineProperties(childProcess, {
		then: {
			configurable: false,
			writable: false,
			enumerable: false,
			value: promise.then.bind(promise),
		},
		catch: {
			configurable: false,
			writable: false,
			enumerable: false,
			value: promise.catch.bind(promise),
		},
		spinner: {
			configurable: false,
			writable: false,
			enumerable: false,
			value: spinner,
		},
	});

	return childProcess;
}

export function npxRun(script: string, cmd: string, args: string[] = [], options?: SpawnOptions) {
	return spawn('npx', [script, cmd].concat(args), options);
}

export function npmRun(script: string, args: string[] = [], options?: SpawnOptions) {
	return spawn('npm', ['run', script, '--'].concat(args), options);
}

export function npmInstall(options: SpawnOptions = {}) {
	return spawn('npm', ['install'], options);
}

export function npmInstallPackage(name: string, saveAs: boolean | 'dev' = true, options: SpawnOptions = {}) {
	const args = ['install', name];

	if (saveAs === 'dev') {
		args.push('--save-dev');
	} else if (saveAs) {
		args.push('--save');
	}

	return spawn('npm', args, options);
}
