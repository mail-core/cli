import { promise, Options, Ora } from 'ora';
import ora = require('ora');
import { interactiveToolNewLine } from '../interactive/interactive';

export type SpinnerOptions = Options & {
	readonly autoStart?: boolean;
}

export type Spinner = {
	[K in keyof Ora]: Ora[K];
} & {
	done: Ora['succeed'];
	status(text?: string): void;
	try<R>(
		executer: (spinner: Spinner) => R,
		complete?: (spinner: Spinner, err?: any) => void,
	): R | undefined;
};

const __spinners__ = [] as Spinner[];

export function stopAllSpinners(as: 'fail' | 'done' | 'warn', text?: string) {
	__spinners__.forEach((spinner) => {
		if (spinner.isSpinning) {
			spinner[as](text);
		}
	});
}

export function createSpinner(options?: SpinnerOptions): Spinner;
export function createSpinner(action: PromiseLike<unknown>, options?: SpinnerOptions): Spinner;
export function createSpinner(): Spinner {
	if (isPromiseLike(arguments[0])) {
		return promise(arguments[0], arguments[1]) as Spinner;
	}

	const options = {
		stream: process.stdout,
		...arguments[0] as SpinnerOptions
	};
	const spinner = ora(options) as Spinner;
	const start = spinner.start;
	
	spinner.start = function (...args: Parameters<typeof start>) {
		interactiveToolNewLine.touch(options.prefixText as string);
		return start.apply(this, args);
	};
	
	__spinners__.push(spinner);
	autoStart(spinner, options);

	spinner.done = spinner.succeed;
	
	spinner.status = function (text?: string) {
		const _priv = this as {_origText?: string};

		if (!_priv._origText) {
			_priv._origText = this.text;
		}

		if (text == null) {
			if (_priv._origText) {
				this.text = _priv._origText;
			}

			_priv._origText = undefined;
		} else {
			this.text = `${_priv._origText}: ${text}`;
		}
	};

	spinner.try = function (executer, complete) {
		try {
			const result = executer(this);
			this.succeed();
			complete && complete(this);
			return result;
		} catch (err) {
			this.fail();
			complete && complete(this, err);
			return undefined;
		}
	};

	return spinner;
}

export function spinnerFromPromise<T extends PromiseLike<unknown>>(action: T, options?: SpinnerOptions): T {
	createSpinner(action, options);
	return action;
}

export function isSpinnerInstance(val: any): val is Spinner {
	return !!(val && typeof val === 'object' && typeof val.start === 'function');
}

function isPromiseLike(value: any): value is PromiseLike<unknown> {
	return value && typeof value.then === 'function';
}

function autoStart(spinner: Spinner | Ora, options?: SpinnerOptions) {
	spinner[options && options.autoStart !== false ? 'start' : 'stop']();
}
