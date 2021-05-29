export * from './command/command';
export * from './command/exec';
export * from './interactive/interactive';
export * from './pkg';
export * from './console';
export type {
	Options as BoxenOptions,
	Spacing as BoxenSpacing,
	CustomBorderStyle as BoxenCustomBorderStyle,
} from 'boxen';

import open = require('open');
import boxen = require('boxen');
import stripAnsi = require('strip-ansi');

import { prompt } from './inquirer';
import { interactive, confirm, select, input } from './interactive/interactive';

export {
	PROCESS_PID,
	CI_JOB_ID,
	IS_CI_ENV,
	IS_SUDO,
	SUDO_UID,
} from './process/id';
export {addProcessExitListener} from './process/exit';
export {addProcessSummary} from './process/summary';

export {
	open as openURL,
	boxen,
	stripAnsi,
};

export const cliTools = {
	prompt,
	interactive,
	confirm,
	input,
	select,
};
