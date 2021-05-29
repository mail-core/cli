import stringLength = require('string-length');

export type ListOptions = {
	bullet?: string;
	indent?: number;
	glue?: string;
	fixedCol?: boolean | number;
}

export function getLengthOffset(val: string) {
	const re = /[^\w]+(\[\d+m)/ug;
	let len = 0;
	let match: RegExpExecArray | null = null;
	
	while (match = re.exec(val)) {
		len += match[1].length + 1;
	}

	return len
}

export function list(
	console: Pick<Console, 'log'>,
	items: Array<string | string[]>,
	options: ListOptions = {},
) {
	const {
		bullet = '→',
		indent = 1,
		glue = ' ',
		fixedCol = true,
	} = options;
	const colPad: Record<number, number> = {};
	const calcColPad = (val: string | undefined, idx: number) => {
		colPad[idx] = Math.max(
			val == null ? 0 : stringLength(val),
			colPad[idx] || 0,
		);
	};

	if (fixedCol) {
		items.forEach((item) => {
			if (Array.isArray(item)) {
				if (fixedCol === true) {
					item.forEach(calcColPad);
				} else {
					calcColPad(item[fixedCol], fixedCol);
				}
			}
		});
	}

	items.forEach((item) => {
		const args = [bullet.padStart(indent)].concat(item).map((val, idx) => {
			return val.padEnd(colPad[idx-1] ? colPad[idx-1] + getLengthOffset(val) : 0);
		});
		
		console.log(args.join(glue));
	});
}
