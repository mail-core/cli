
import type {InferredOptionType} from 'yargs';
import type {OptionWithArg} from '../args';
import type {PromiseValue} from 'type-fest';
import type {Option} from '../args';
import { prompt } from 'inquirer';
import { green, bold, gray } from '../color';

export type InteractiveReturnType<
	T extends (...rest: any[]) => Promise<InteractiveAnswers<any>>
> = PromiseValue<ReturnType<T>>;

export type InteractiveQuestion = {
	value: string | boolean | string[];
	prefix?: string;
	suffix?: string;
	message: string;
	type?: 'confirm' | 'input' | 'list' | 'checkbox' | 'radio';
	choices?: Array<{name?: string; value: string}>;
	when?: (answers: Record<string, unknown>) => boolean;
};

export type InteractiveQuestionGroup = {
	[name: string]: InteractiveQuestion | InteractiveQuestionGroup
};

export type InteractiveQuestionInferType<
	T extends InteractiveQuestion | InteractiveQuestionGroup
> = T extends InteractiveQuestionGroup
	? {[K in keyof T]: InteractiveQuestionInferType<T[K]>}
	: (T['value'] extends boolean ? boolean : T['value'])
;

export type InteractiveAnswers<T extends InteractiveQuestionGroup> = {
	[K in keyof T]: InteractiveQuestionInferType<T[K]>;
};

export type InteractiveToolsInit = {
	prefix?: string;
	yes?: boolean;
}

const dottedNewLine = '·'.repeat(10);

function getQuestionType(q: InteractiveQuestion) {
	if (q.type) {
		return q.type;
	}

	if (Array.isArray(q.choices)) {
		return 'list';
	}

	if (typeof q.value === 'boolean') {
		return 'confirm';
	}

	return 'input';
}

function isQuestion(val: any): val is InteractiveQuestion {
	return val && typeof val === 'object' && 'message' in val && 'value' in val;
}

function isQuestionGroup(val: any): val is InteractiveQuestionGroup {
	return val && typeof val === 'object' && isQuestion(Object.values(val)[0]);
}

function questionGroupWalker(
	questions: InteractiveQuestionGroup,
	iterator: (xpath: string[], q: InteractiveQuestion) => void,
) {
	(function next(xpath: string[], questions: InteractiveQuestion | InteractiveQuestionGroup) {
		Object.entries(questions).forEach(([name, rest]) => {
			if (isQuestionGroup(rest)) {
				next(xpath.concat(name), rest);
			} else {
				iterator(xpath.concat(name), rest);
			}
		});
	})([], questions);
}


export const interactiveToolNewLine = {
	before: false,
	after: false,
	touch(label?: string) {
		interactiveToolNewLine.before = true;

		if (interactiveToolNewLine.after) {
			interactiveToolNewLine.after = false;
			console.log(gray(label || '', dottedNewLine));
		}
	},
};

export type RequireConfig = boolean | {
	demandOption?: boolean;
	allowEmpty?: boolean;
	allowDefault?: boolean;
}

function castOption<O extends Option, T extends InferredOptionType<O>>(option: O, val: T): T {
	if (option.type === 'boolean') {
		return Boolean(val) as T;
	} else if (option.type === 'number') {
		return Number(val) as T;
	}

	return String(val) as T;
}

export function createInteractiveTools(init: InteractiveToolsInit = {}) {
	const baseProps = {
		prefix: init.prefix ? `${init.prefix} ${bold(green('?'))}` : undefined,
	};

	async function interactive<T extends InteractiveQuestionGroup>(questions: T) {
		const list = [] as Array<
			InteractiveQuestion & {
				name: string[];
				type: string;
				default: InteractiveQuestion['value'] | undefined;
			}
		>;

		questionGroupWalker(questions, (xpath, rest) => {
			list.push({
				...baseProps,
				name: xpath,
				type: getQuestionType(rest),
				default: rest.value === '' ? undefined : rest.value,
				...rest,
			});
		});

		interactiveToolNewLine.after = true;

		if (interactiveToolNewLine.before) {
			interactiveToolNewLine.before = false;
			console.log(gray(init.prefix || '', dottedNewLine));
		}

		const answers = await prompt(list) as InteractiveAnswers<T>;

		questionGroupWalker(questions, (xpath, rest) => {
			let i = 0;
			let cursor = answers as any;

			for (; i < xpath.length - 1; i++) {
				const k = xpath[i];
				if (cursor[k] === undefined) {
					cursor[k] = {};
				}
				cursor = cursor[k];
			}

			if (cursor[xpath[i]] === undefined) {
				cursor[xpath[i]] = rest.value;
			}
		});

		return answers;
	}

	async function confirm(msg: string, value: boolean) {
		const {input} = await interactive({
			input: {
				message: msg,
				value,
				type: 'confirm',
			},
		})

		return input;
	}

	async function input(msg: string, value: string) {
		const {input} = await interactive({
			input: {
				message: msg,
				value,
				type: 'input',
			},
		})

		return input;
	}

	async function select(
		msg: string,
		value: string,
		choices: InteractiveQuestion['choices'],
		type: 'list' | 'radio' | 'checkbox' = 'list',
	) {
		const {input} = await interactive({
			input: {
				message: msg,
				value,
				type,
				choices,
			},
		})

		return input;
	}

	async function require<O extends OptionWithArg>(
		option: O,
		configOrDemandOption?: RequireConfig,
	): Promise<NonNullable<InferredOptionType<O>>> {
		const config = typeof configOrDemandOption === 'object' ? configOrDemandOption : {
			allowEmpty: false,
		};
		const desc = option.desc || option.describe || option.description;
		const msg = `${desc}:`;
		const defaultValue = option.default;
		const hasDefault = defaultValue != null
		const isDefault = hasDefault && defaultValue === option.value;
		let value: any = option.value;
	
		// Если не `--yes`, то спрашиваем юзера
		if (!init.yes && (value == null || isDefault && !config.allowDefault) ) {
			if (option.type === 'boolean') {
				value = await confirm(msg, defaultValue);
			} else if (option.choices != null) {
				const type = option.type === 'array' || option.array ? 'checkbox' : 'list';
				const items = option.choices!.map((value) => ({
					value: value + '',
					name: value + '',
				}));

				value = await select(msg, defaultValue, items, type);
			} else {
				value = await input(msg, defaultValue);
			}
		}

		// Проверяем значение на «пустату»
		if (
			(init.yes || config.demandOption) &&
			(
				(value == '' && !config.allowEmpty) ||
				(value == null)
			)
		) {
			throw new Error(`"${option.name}" — "${desc}" required`);
		}

		return castOption(option, value);
	}

	return {
		interactive,
		confirm,
		input,
		select,
		require,
	};
}

const tools = createInteractiveTools();

export type CLITools = ReturnType<typeof createInteractiveTools>;

export const interactive = tools.interactive;
export const confirm = tools.confirm;
export const input = tools.input;
export const select = tools.select;
