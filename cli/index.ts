import { initCLI } from '../command/command';
import { run } from './command/run';
import { shebangFix } from './command/shebang-fix';
import { env } from './command/env';
import { create } from './command/create';
import { init } from './command/init';
import { local } from './command/local';

initCLI(
	// Env
	{__dirname},

	// Command List
	init,
	create,
	run,
	local,
	env,
	shebangFix,
);
