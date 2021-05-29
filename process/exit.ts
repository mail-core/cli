export type ProcessExitEvent = (
	| {
		type: 'exit'
		code: number
	}
	| {
		type: 'break' | 'kill'
		signal: NodeJS.Signals;
	}
	| {
		type: 'uncaughtException';
		reason: Error;
	}
);

export type ProcessExitHandler = (evt: ProcessExitEvent) => void;

export function addProcessExitListener(handler: ProcessExitHandler) {
	const listeners: Array<Parameters<typeof process.on>> = [];
	const add = (...args: Parameters<typeof process.on>) => {
		listeners.push(args);
		process.on(args[0], args[1]);
	};

	['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2'].forEach((type) => {
		add(type, (coreOrSignal: number | NodeJS.Signals) => {
			if (type === 'exit') {
				handler({
					type: 'exit',
					code: coreOrSignal as number,
				});
			} else {
				handler({
					type: type === 'SIGINT' ? 'break' : 'kill',
					signal: coreOrSignal as NodeJS.Signals,
				});
			}
		});
	});
	
	add('uncaughtException',  (reason: Error) => {
		handler({
			type: 'uncaughtException',
			reason,
		});
	});

	return function removeExitListener() {
		listeners.forEach(([type, listener]) => {
			process.off(type, listener);
		})
		listeners.length = 0;;
	}
}
