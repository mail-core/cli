import { spawn } from './exec';
// import { join } from 'path';

it('spawn: done', async () => {
	const child = spawn('pwd', [], {stdio: undefined});

	expect(typeof child.then).toBe('function');
	expect(await child).toEqual({
		code: 0,
		stdout: `${process.cwd()}\n`,
		stderr: '',
	});
});

it('spawn: fail', async () => {
	const rnd = `${Date.now()}${Math.random()}`

	try {
		const result = await spawn('cat', [rnd], {stdio: undefined});
		expect(result).toBe('none');
	} catch (err) {
		expect(err).toEqual({
			code: 1,
			stdout: '',
			stderr: `cat: ${rnd}: No such file or directory\n`,
		});
	}
});

it('git config --list', async () => {
	const {stdout} = await spawn('git', ['config', '--list'], {stdio: undefined});
	expect(stdout).not.toBe('');
});
