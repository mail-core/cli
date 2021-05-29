import { findNearestPackageJson, readPackageJson, updatePackageJson, dropPackageJsonCache, ROOT_DIR } from './pkg';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

describe('pkg:read', () => {
	it('findNearestPackageJson', () => {
		expect(findNearestPackageJson(__dirname)).toBe(resolve('package.json'));
	});

	it('cached', () => {
		expect(readPackageJson(ROOT_DIR) === readPackageJson(__dirname)).toBe(true);
	});

	it('readPackageJson', () => {
		expect(readPackageJson().name).toBe('@mail-core/cli');
	});

	it('readPackageJson repeat with different dir and same file', () => {
		readPackageJson();

		expect(readPackageJson('./pkg').name).toBe('@mail-core/cli');
	});

	it('readPackageJson repeat with different dir and different file', () => {
		expect(readPackageJson().name).toBe('@mail-core/cli');

		expect(readPackageJson('./pkg/fixture').name).toBe('testfile');
	});
})

const FIXTURE_PATH = resolve('./pkg/fixture/package.json');

describe('pkg:modify', () => {
	let fixtureContent: string;
	beforeEach(() => {
		fixtureContent = readFileSync(FIXTURE_PATH, 'utf-8');
	});

	afterEach(() => {
		dropPackageJsonCache();
		writeFileSync(FIXTURE_PATH, fixtureContent);
	})

	it('updatePackageJSON', () => {
		expect(readPackageJson('./pkg/fixture').name).toBe('testfile');

		updatePackageJson('./pkg/fixture', {name: 'test'});

		expect(JSON.parse(readFileSync('./pkg/fixture/package.json', 'utf-8')).name).toBe('test');
	});

	it('read after updatePackageJson', () => {
		expect(readPackageJson('./pkg/fixture').name).toBe('testfile');

		updatePackageJson('./pkg/fixture', {name: 'test'});

		expect(readPackageJson('./pkg/fixture').name).toBe('test');
	});

	it('cached read after external update', () => {
		expect(readPackageJson('./pkg/fixture').name).toBe('testfile');

		writeFileSync(FIXTURE_PATH, '{name:"test"}');

		expect(readPackageJson('./pkg/fixture').name).toBe('testfile');
	});


	it('uncached read after external update', () => {
		expect(readPackageJson('./pkg/fixture').name).toBe('testfile');

		writeFileSync(FIXTURE_PATH, '{"name":"test"}');

		expect(readPackageJson('./pkg/fixture', {cache: false}).name).toBe('test');
	});
})
