import {tmpdir} from 'os';
import {appendFileSync, existsSync, writeFileSync, readFileSync, unlinkSync} from 'fs';
import {join} from 'path';
import { PROCESS_PID } from './id';
import type {Options} from 'boxen';
import boxen = require('boxen');
import { bold } from 'chalk';

const SUMMARY_FILE = join(tmpdir(), '.mail-core-cli.summary.json');
const STYLE_BY_TYPE: Record<ProcessSummaryItem['type'], {
	boxen: Options;
}> = {
	'info': {
		boxen: {
			margin: 1,
			padding: {left: 4, right: 4, top: 1, bottom: 1},
			borderStyle: 'double',
			borderColor: 'green',
		},
	},
	
	'warn': {
		boxen: {
			margin: 1,
			padding: {left: 4, right: 4, top: 1, bottom: 1},
			borderStyle: 'single',
			borderColor: 'yellow',
		},
	},

	'error': {
		boxen: {
			margin: 1,
			padding: {left: 4, right: 4, top: 1, bottom: 1},
			borderStyle: 'singleDouble',
			borderColor: 'red',
		},
	},
};

export type ProcessSummaryItem = {
	type: 'info' | 'warn' | 'error';
	title: string;
	detail: string;
	// todo: Нужен вывод только для процесса, например добавить флаг global?: boolean
}

export type ProcessSummaryItemWithPID = ProcessSummaryItem & {
	pid: number;
}

export function addProcessSummary(item:ProcessSummaryItem): void;
export function addProcessSummary(
	title: ProcessSummaryItem | string,
	detail?: string,
	type?: ProcessSummaryItem['type'],
): void;
export function addProcessSummary(
	title: ProcessSummaryItem | string,
	detail: string = '',
	type: ProcessSummaryItem['type']  = 'info',
): void {
	const item: ProcessSummaryItemWithPID = {
		...(typeof title !== 'string' ? title : {type, title, detail}),
		pid: PROCESS_PID,
	};

	appendFileSync(SUMMARY_FILE, `${JSON.stringify(item)}\n`);
}

export function startProcessSummary() {
	if (!existsSync(SUMMARY_FILE)) {
		writeFileSync(SUMMARY_FILE, `${PROCESS_PID}\n`);
	}

	// Вывод Summary
	return () => {
		const rows = readFileSync(SUMMARY_FILE).toString().trim().split('\n');

		if (parseInt(rows[0]) !== PROCESS_PID) {
			return;
		}

		unlinkSync(SUMMARY_FILE);

		const group: {
			[K in ProcessSummaryItem['type']]?: ProcessSummaryItem[]
		} = {};
		
		// COLLECT
		rows.slice(1).forEach((raw) => {
			const item = JSON.parse(raw) as ProcessSummaryItem;
			const {type} = item;
			
			if (!Array.isArray(group[type])) {
				group[type] = [];
			}

			group[type]!.push(item);
		});

		// OUTPUT
		(['warn', 'info', 'error'] as ProcessSummaryItem['type'][]).forEach((type) => {
			const items = group[type]
			const style = STYLE_BY_TYPE[type];

			if (!items || !items.length) {
				return;
			}
			
			const content = items
				.map(({title, detail}) => {
					const formatedDetail = detail.trim().split('\n').map((v) => v.trim()).join('\n');
					return `${bold(title)}${detail ? `\n${formatedDetail}` : ''}`;
				})
				.join('\n\n')
			;

			console[type](boxen(content, style.boxen));
		});
	};
}
