import { parse, Options, Arguments, InferredOptionTypes, PositionalOptions, InferredOptionType } from 'yargs';

export type Option = 
	| Options & { interactive?: true; }
	| PositionalOptions & { positional: true; interactive?: true; }
;

export interface OptionWithArg extends Options {
	name: string;
	value: InferredOptionType<this>;
}

type AddOptionArg<T extends Options> = T & {
	name: string;
	value: InferredOptionType<T>;
}

export type OptionsMap = Record<string, Option>;
export type OptionWithArgMap<M extends OptionsMap> = {
	[K in keyof M]: AddOptionArg<M[K]>;
};

export type Argv<O extends OptionsMap> = Arguments<InferredOptionTypes<O>>;

export function parseArgv<O extends OptionsMap>(_: O, argv: string[]) {
	return parse(argv) as Argv<O>;
}

export function parseArgvString<O extends OptionsMap>(_: O, value: string) {
	return parse(value.trim().split(/\s+/)) as Argv<O>;
}
