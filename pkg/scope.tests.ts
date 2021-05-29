import { readPackageJson, updatePackageJson } from './pkg';
import { initPackageJsonScope, PkgScopeStatus } from './scope';

const dirname = __dirname;

describe('scope', () => {
	const ROOT_DIR = `${dirname}/fixture/scope/`;
	const __dirname = `${dirname}/fixture/scope/pkg/`;
	const pkg = readPackageJson(__dirname);

	beforeEach(() => {
		updatePackageJson(__dirname, {
			version: '1',
		});

		updatePackageJson(ROOT_DIR, {
			[pkg.name as string]: undefined,
		});
	});

	it('install', async () => {
		const scope = await initPackageJsonScope({
			ROOT_DIR,
			__dirname,
			name: 'test',
			async handler() {
				return { foo: true };
			},
		});

		expect(scope).toEqual({
			name: 'test',
			version: pkg.version,
			props: {foo: true},
			status: PkgScopeStatus.installed,
		});
	});

	it('updated', async () => {
		const install = () => initPackageJsonScope({
			ROOT_DIR,
			__dirname,
			name: 'test',
			async handler(scope, ov) {
				return { ov, foo: 1 + (scope.props?.foo as number||0) };
			},
		});

		await install();

		updatePackageJson(__dirname, {
			version: '2',
		});

		const scope = await install();

		expect(scope).toEqual({
			name: 'test',
			version: '2',
			props: {foo: 2, ov: "1"},
			status: PkgScopeStatus.updated,
		});
	})
});
